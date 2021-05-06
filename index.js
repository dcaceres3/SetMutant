const Mysql = require('./mysql')
const repeats = 4;

exports.handler = async (event) => {
    try {
        const letters = ['A', 'T', 'C', 'G'];
        let body = JSON.parse(event.body);
        let dna = body.dna;
        console.log(dna[0]);
        let columnsInfo = new Array(dna[0].length);
        let adnColumnsLength = dna[0].length;
        let adnRowsLength = dna.length;
        let adnMutantCoincidence = 0;
        let srtToFind = new Array(letters.length);
        let splitAdn;
        let arrDiagonals = [];
        //console.log(adnRowsLength);
        letters.forEach((letter, indexLetter) => {
            srtToFind[indexLetter] = letter.repeat(repeats);
            dna.forEach((adn, adnIndex) => {
                // Validate rows...
                if (adn.includes(srtToFind[indexLetter])) {
                    adnMutantCoincidence++;
                }
                if (indexLetter === 0) {
                    // Build columns array...
                    splitAdn = adn.split('');
                    for (let i in splitAdn) {
                        columnsInfo[i] = columnsInfo[i] !== undefined ?
                            columnsInfo[i] + splitAdn[i] :
                            splitAdn[i];
                    }
                    // Tag positions array...
                    if (indexLetter === 0) {
                        row = []
                        row = adn.split('');
                        for (let i in row) {
                            arrDiagonals.push({
                                letter: row[i],
                                row: adnIndex + 1,
                                column: parseInt(i) + 1,
                                position: parseInt((adnIndex + 1).toString() + (parseInt(i) + 1))
                            });
                        }
                    }
                }
            });
        });

        // Validate columns...
        columnsInfo.forEach(column => {
            for (let i in srtToFind) {
                if (column.includes(srtToFind[i])) {
                    adnMutantCoincidence++;
                }
            }
        });

        // Validate Diagonals...
        let result = getDiagonals(arrDiagonals, adnColumnsLength, adnRowsLength);
        result.forEach(diagonal => {
            for (let i in srtToFind) {
                if (diagonal.includes(srtToFind[i])) {
                    adnMutantCoincidence++;
                }
            }
        });

        let statusCode;
        let isMutant;
        if (adnMutantCoincidence > 1) {
            statusCode = 200;
            isMutant = true;
        } else {
            statusCode = 403;
            isMutant = false;
        }

        await saveAdn(dna.toString(), isMutant);
        return {statusCode,body:JSON.stringify({"EsMutante":isMutant}) };
    } catch (error) {
        console.log(error);
    }
};

async function saveAdn(registroAdn, isMutant) {
    let query = `INSERT INTO Adn (registroAdn,isMutant) VALUES (?,?)`;
    let params = [registroAdn, isMutant];
    let result = await Mysql.executeQuery(query,params);
    return result;
}


function getDiagonals(arrDiagonals, adnColumnsLength, adnRowsLength) {
    const diagonal11 = 11;
    const diagonal9 = 9;
    // Construir diagonales 11
    let arrDiagonalsGet = [];
    let filter;
    let position = 11;
    for (let index = 0; index < adnRowsLength; index++) {
        let increment11 = 0;
        let letters = '';
        for (let i = adnColumnsLength - index; i >= 1; i--) {
            filter = arrDiagonals.filter(f => f.position === position + increment11);
            letters += filter[0].letter;
            increment11 += diagonal11;
        }
        if (letters.length >= repeats)
            arrDiagonalsGet.push(letters);
        position++;
    }
    // Construir diagonales 9
    let position9 = parseInt(1 + adnColumnsLength.toString());
    let decrease = 0;
    for (let index = adnRowsLength; index > 0; index--) {
        let increment9 = 0;
        let letters = '';
        for (let i = adnRowsLength - decrease; i >= 1; i--) {
            filter = arrDiagonals.filter(f => f.position === position9 + increment9);
            letters += filter[0].letter;
            increment9 += diagonal9;
        }
        if (letters.length >= repeats)
            arrDiagonalsGet.push(letters);
        position9--;
        decrease++;
    }
    return arrDiagonalsGet;
}

//this.handler({
//   dna: ["ATGCGA", "CCGTAC", "TTCAGT", "AGACBV", "CAASCA", "TCARTC"]
//});
// isMutant(["ATGCGA", "CAGTGC", "TTATGT", "AGAAGG", "CCCCTA", "TCACTG"]);
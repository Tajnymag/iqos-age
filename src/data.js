function median(numbers) {
    const sortedNumbers = [...numbers].sort();

    const middleIndex = Math.floor(sortedNumbers.length / 2);

    if (sortedNumbers.length % 2 === 0) {
        return (sortedNumbers[middleIndex] + sortedNumbers[middleIndex - 1]) / 2;
    } else {
        return sortedNumbers[middleIndex];
    }
}

function average(numbers) {
    let sum = 0;

    numbers.forEach((number) => {
        sum += number;
    });

    return sum / numbers.length;
}

module.exports = {average, median};
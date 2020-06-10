export default {
    // this function should update an array with new/removed items, while keeping the original items in the same place
    updateOrdered: (oldItems, newItems) => {
        const removedItems = oldItems.filter(item => !newItems.includes(item));
        const addedItems = newItems.filter(item => !oldItems.includes(item));
        let items = []
        items = oldItems.concat(addedItems)
        items = items.filter(item => !removedItems.includes(item));
        return items
    },
    getCardValue: (value) => {
        let values = {
            1: '2',
            2: '3',
            3: '4',
            4: '5',
            5: '6',
            6: '7',
            7: '8',
            8: '9',
            9: '10',
            10: 'Jack',
            11: 'Queen',
            12: 'King',
            13: 'Ace'
        }
        console.log(values[value])
        return values[value]

    }
}
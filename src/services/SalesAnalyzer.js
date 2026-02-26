export class SalesAnalyzer {
    constructor(csvData) {
        const parsedData = this.parseCSV(csvData);
        this.salesData = this.validateData(parsedData);
    }

    parseCSV(data) {
        const lines = data.trim().split('\n');

        return lines.slice(1).map(line => {
            const row = line.split(',');
            return {
                date: row[0],
                month: row[0].slice(0, 7),
                sku: row[1],
                price: Number(row[2]),
                qty: Number(row[3]),
                total: Number(row[4]),
                raw: line
            };
        });
    }

    validateData(data) {
        const valid = [];
        data.forEach(item => {
            const dateObj = new Date(item.date);
            const isValidDate = !isNaN(dateObj.getTime()) && item.date.length === 10;
            const isTotalOk = item.price * item.qty === item.total;
            const isQtyOk = item.qty >= 1;
            const isPriceOk = item.price >= 0;
            const isTotalPos = item.total >= 0;

            if (isValidDate && isTotalOk && isQtyOk && isPriceOk && isTotalPos) {
                valid.push(item);
            } else {
                console.warn(`Data Inconsistency Detected:\n\tRow: ${item.raw}`);
                const errs = [];
                if (!isValidDate) errs.push('Malformed Date');
                if (!isTotalOk) errs.push('Unit Price * Quantity != Total Price');
                if (!isQtyOk) errs.push('Quantity < 1');
                if (!isPriceOk) errs.push('Unit Price < 0');
                if (!isTotalPos) errs.push('Total Price < 0');
                console.warn(`\tReasons: ${errs.join(', ')}\n`);
            }
        });
        return valid;
    }

    getTotalSales() {
        return this.salesData.reduce((sum, item) => sum + item.total, 0);
    }

    getMonthWiseSales() {
        const sales = {};

        this.salesData.forEach(item => {
            if (!sales[item.month]) sales[item.month] = 0;
            sales[item.month] += item.total;
        });

        return sales;
    }

    getMostPopularItems() {
        const monthItems = {};

        this.salesData.forEach(item => {
            if (!monthItems[item.month]) monthItems[item.month] = {};
            if (!monthItems[item.month][item.sku]) monthItems[item.month][item.sku] = [];
            monthItems[item.month][item.sku].push(item.qty);
        });

        const res = {};

        Object.entries(monthItems).forEach(([month, items]) => {
            let top = { sku: '', qty: 0, orders: [] };

            Object.entries(items).forEach(([sku, orders]) => {
                const total = orders.reduce((sum, q) => sum + q, 0);
                if (total > top.qty) top = { sku, qty: total, orders };
            });

            const { sku, orders } = top;
            if (sku) {
                const min = Math.min(...orders);
                const max = Math.max(...orders);
                const avg = orders.reduce((sum, q) => sum + q, 0) / orders.length;

                res[month] = {
                    item: sku,
                    minOrders: min,
                    maxOrders: max,
                    avgOrders: Number(avg.toFixed(2))
                };
            }
        });

        return res;
    }

    getHighestRevenueItems() {
        const monthRev = {};

        this.salesData.forEach(item => {
            if (!monthRev[item.month]) monthRev[item.month] = {};
            if (!monthRev[item.month][item.sku]) monthRev[item.month][item.sku] = 0;
            monthRev[item.month][item.sku] += item.total;
        });

        const res = {};

        Object.entries(monthRev).forEach(([month, items]) => {
            let top = { sku: '', rev: 0 };

            Object.entries(items).forEach(([sku, rev]) => {
                if (rev > top.rev) top = { sku, rev };
            });

            res[month] = { item: top.sku, revenue: top.rev };
        });

        return res;
    }

    getItemMonthToMonthGrowth() {
        const revs = {};
        const monthsSet = new Set();

        this.salesData.forEach(item => {
            monthsSet.add(item.month);
            if (!revs[item.sku]) revs[item.sku] = {};
            if (!revs[item.sku][item.month]) revs[item.sku][item.month] = 0;
            revs[item.sku][item.month] += item.total;
        });

        const allMonths = Array.from(monthsSet).sort();
        const res = {};

        Object.entries(revs).forEach(([sku, months]) => {
            res[sku] = {};

            for (let i = 1; i < allMonths.length; i++) {
                const prev = allMonths[i - 1];
                const curr = allMonths[i];

                const prevRev = months[prev] || 0;
                const currRev = months[curr] || 0;

                let str = '0.00%';
                if (prevRev === 0 && currRev > 0) {
                    str = 'Infinity% (No sales in previous month)';
                } else if (prevRev > 0 || currRev > 0) {
                    const diff = ((currRev - prevRev) / prevRev) * 100;
                    str = `${diff.toFixed(2)}%`;
                }

                res[sku][`${prev} to ${curr}`] = str;
            }
        });

        return res;
    }

    generateReport() {
        console.log('1. Total Sales:', this.getTotalSales());
        console.log('2. Month-wise Sales:', this.getMonthWiseSales());

        console.log('\n3. Most Popular Item Each Month:');
        Object.entries(this.getMostPopularItems()).forEach(([month, stats]) => {
            console.log(month, stats);
        });

        console.log('\n4. Highest Revenue Item Each Month:');
        Object.entries(this.getHighestRevenueItems()).forEach(([month, stats]) => {
            console.log(month, stats);
        });

        console.log('\n5. Month-to-Month Growth Rate Per Item:');
        console.log(this.getItemMonthToMonthGrowth());
    }
}

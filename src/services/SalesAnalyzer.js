export class SalesAnalyzer {
    constructor(csvData) {
        this.salesData = this.parseCSV(csvData);
    }

    parseCSV(data) {
        const lines = data.trim().split('\n');

        return lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                date: values[0],
                month: values[0].slice(0, 7),
                sku: values[1],
                unitPrice: Number(values[2]),
                quantity: Number(values[3]),
                totalPrice: Number(values[4])
            };
        });
    }

    getTotalSales() {
        return this.salesData.reduce((total, sale) => total + sale.totalPrice, 0);
    }

    getMonthWiseSales() {
        const monthSales = {};

        this.salesData.forEach(sale => {
            if (!monthSales[sale.month]) {
                monthSales[sale.month] = 0;
            }
            monthSales[sale.month] += sale.totalPrice;
        });

        return monthSales;
    }

    getMostPopularItems() {
        const monthlyItems = {};

        this.salesData.forEach(sale => {
            if (!monthlyItems[sale.month]) {
                monthlyItems[sale.month] = {};
            }

            if (!monthlyItems[sale.month][sale.sku]) {
                monthlyItems[sale.month][sale.sku] = [];
            }

            monthlyItems[sale.month][sale.sku].push(sale.quantity);
        });

        const result = {};

        Object.entries(monthlyItems).forEach(([month, items]) => {
            let mostPopularParams = { sku: '', totalQty: 0, orders: [] };

            Object.entries(items).forEach(([sku, orders]) => {
                const totalQty = orders.reduce((sum, qty) => sum + qty, 0);

                if (totalQty > mostPopularParams.totalQty) {
                    mostPopularParams = { sku, totalQty, orders };
                }
            });

            const { sku, orders } = mostPopularParams;
            if (sku) {
                const min = Math.min(...orders);
                const max = Math.max(...orders);
                const avg = orders.reduce((sum, qty) => sum + qty, 0) / orders.length;

                result[month] = {
                    item: sku,
                    minOrders: min,
                    maxOrders: max,
                    avgOrders: Number(avg.toFixed(2))
                };
            }
        });

        return result;
    }

    getHighestRevenueItems() {
        const monthlyRevenue = {};

        this.salesData.forEach(sale => {
            if (!monthlyRevenue[sale.month]) {
                monthlyRevenue[sale.month] = {};
            }

            if (!monthlyRevenue[sale.month][sale.sku]) {
                monthlyRevenue[sale.month][sale.sku] = 0;
            }

            monthlyRevenue[sale.month][sale.sku] += sale.totalPrice;
        });

        const result = {};

        Object.entries(monthlyRevenue).forEach(([month, items]) => {
            let highestRevenueParams = { sku: '', revenue: 0 };

            Object.entries(items).forEach(([sku, revenue]) => {
                if (revenue > highestRevenueParams.revenue) {
                    highestRevenueParams = { sku, revenue };
                }
            });

            result[month] = {
                item: highestRevenueParams.sku,
                revenue: highestRevenueParams.revenue
            };
        });

        return result;
    }

    generateReport() {
        console.log('1. Total Sales:', this.getTotalSales());
        console.log('2. Month-wise Sales:', this.getMonthWiseSales());

        const popularItems = this.getMostPopularItems();
        console.log('3. Most Popular Item Each Month:');
        Object.entries(popularItems).forEach(([month, stats]) => {
            console.log(month, stats);
        });

        const revenueItems = this.getHighestRevenueItems();
        console.log('4. Highest Revenue Item Each Month:');
        Object.entries(revenueItems).forEach(([month, stats]) => {
            console.log(month, stats);
        });
    }
}

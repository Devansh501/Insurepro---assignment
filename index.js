import { rawData } from './src/data/store-data.js';
import { SalesAnalyzer } from './src/services/SalesAnalyzer.js';

const analyzer = new SalesAnalyzer(rawData);
analyzer.generateReport();

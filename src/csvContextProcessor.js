import fs from 'fs';
import csv from 'csv-parser';

async function processCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function createAdditionalContext() {
  try {
    // Process sample products CSV
    const products = await processCSV('path/to/product_data_cleaned.csv');
    const sampleProducts = products.slice(0, 5).map(product => 
      `${product.name}: ${product.description} (Price: $${product.price})`
    ).join('; ');

    // Process email templates CSV
    const emails = await processCSV('path/to/emails.csv');
    const emailTemplates = emails.slice(0, 3).map(email => 
      `${email.subject}: ${email.snippet}`
    ).join('; ');

    // Process performance metrics CSV
    const metrics = await processCSV('path/to/metrics.csv');
    const performanceMetrics = metrics.slice(0, 5).map(metric => 
      `${metric.metric_name}: ${metric.value} (Date: ${metric.date})`
    ).join('; ');

    return {
      sampleProducts,
      emailTemplates,
      performanceMetrics
    };
  } catch (error) {
    console.error('Error processing CSV files:', error);
    throw error;
  }
}

export default createAdditionalContext;
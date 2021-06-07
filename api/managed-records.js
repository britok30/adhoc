import fetch from '../util/fetch-fill';
import URI from 'urijs';

// /records endpoint
window.path = 'http://localhost:3000/records';

// Your retrieve function plus any additional functions go here ...
const retrieve = (options) => {
    let primaryColors = ['red', 'blue', 'yellow'];
    let opts = options || {};
    let limit = 10;
    let page = opts.page || 1;

    let uri = URI(window.path)
        .addSearch('limit', limit + 1)
        .addSearch('offset', (page - 1) * limit);

    if (opts.colors && opts.colors.length > 0) {
        uri.addSearch('color[]', opts.colors);
    }

    return fetch(uri)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log(`HTTP-ERROR: ${response.status}`);
            }
        })
        .then((records) => {
            let isLast = records.length <= limit;
            if (!isLast) {
                records.splice(limit, 1);
            }
            // Primary Colors
            records.forEach(
                (record) =>
                    (record.isPrimary =
                        primaryColors.indexOf(record.color) !== -1)
            );

            // Formatted Data
            let formattedRecords = {};
            formattedRecords.ids = records.map((record) => record.id);
            formattedRecords.open = records.filter(
                (record) => record.disposition == 'open'
            );
            formattedRecords.closedPrimaryCount = records.filter(
                (record) =>
                    record.disposition == 'closed' && record.isPrimary === true
            ).length;
            formattedRecords.previousPage = page == 1 ? null : page - 1;
            formattedRecords.nextPage = isLast ? null : page + 1;

            return formattedRecords;
        })
        .catch((e) => console.log(e));
};

export default retrieve;

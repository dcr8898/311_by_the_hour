// global app
var app = {};

/*
 * View
 */
(function (app) {
    'use strict';

    var model = {},

        chart = {},

        // Return local date per ISO8601 ('2016-06-28')
        dateNow = function dateNow() {
            return new Date().toLocaleDateString('lt-Latn');
        },

        options = {
            chart: {
                type: 'areaspline'
            },
            title: {
                text: '311 by the Hour'
            },
            subtitle: {
                text: "NYC 311 calls by complaint type and the hour of day " +
                    " in which calls were placed for the week ending " +
                     "<input id='date-select' type='date' value='2010-08-03' " +
                     "placeholder='yyyy-mm-dd' min='2010-01-01' " +
                     "max='" + dateNow() + "'><br/>" +
                     "[Inspired by <a href=" +
                     "'http://www.wired.com/2010/11/ff_311_new_york/all/1' " +
                     "target='_blank'>this</a>. See the <a " +
                     "href='https://github.com/dcr8898/311_by_the_hour' " +
                     "target='_blank'>Source code</a>.]",
                useHTML: true,
                style: {
                    color: '#ffffff',
                    'text-align': 'center',
                    'font-size': '1em'
                }
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom',
                itemWidth: 220,
                borderWidth: 1,
                backgroundColor: (Highcharts.theme.legendBackgroundColor)
            },
            xAxis: {
                categories: [
                    '12 AM', '01 AM', '02 AM', '03 AM', '04 AM', '05 AM',
                    '06 AM', '07 AM', '08 AM', '09 AM', '10 AM', '11 AM',
                    '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM',
                    '06 PM', '07 PM', '08 PM', '09 PM', '10 PM', '11 PM'
                ],
                labels: {
                    formatter: function() {
                        switch(this.value.slice(0,2)) {
                            case '01':  return '<h1>&#x1f550</h1>';
                            case '02':  return '<h1>&#x1f551</h1>';
                            case '03':  return '<h1>&#x1f552</h1>';
                            case '04':  return '<h1>&#x1f553</h1>';
                            case '05':  return '<h1>&#x1f554</h1>';
                            case '06':  return '<h1>&#x1f555</h1>';
                            case '07':  return '<h1>&#x1f556</h1>';
                            case '08':  return '<h1>&#x1f557</h1>';
                            case '09':  return '<h1>&#x1f558</h1>';
                            case '10':  return '<h1>&#x1f559</h1>';
                            case '11':  return '<h1>&#x1f55a</h1>';
                            case '12':  return '<h1>&#x1f55b</h1>';
                        }
                    },
                    useHTML: true
                },
                tickmarkPlacement: 'on',
                gridLineWidth: 1
            },
            yAxis: {
                visible: false
            },
            tooltip: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                areaspline: {
                    stacking: 'normal',
                    lineWidth: 0,
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: false
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'No Data',
                data: []
            }]

        },

        validDate = function(date) {
            // Check format
            if (!date.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) { return false; }

            // Check for valid date
            var dateObj = new Date(date);
            if (dateObj == 'Invalid Date') { return false; }

            // Check for valid date range (2010-01-01 to present)
            var minDate = new Date('2010-01-01'),
                maxDate = Date.now() - (dateObj.getTimezoneOffset() * 60000);
            if (dateObj < minDate || dateObj > maxDate) { return false; }

            // All good
            return true;
        },

        refreshDataSeries = function refreshDataSeries(dataSeries) {
            chart.series.forEach(function(chartDataSeries, i) {
                chartDataSeries.setData(dataSeries[i], false);
            });
        },

        init = function init(appModel) {
            model = appModel;
        },

        initChart = function initChart(container) {
            // create chart and return a reference to it
            chart = $('#' + container).highcharts(options).highcharts();
        },

        showMessage = function showMessage(message) {
            chart.showLoading(message);
        },

        hideMessage = function hideMessage() {
            chart.hideLoading();
        },

        getData = function getData() {
            var submittedDate = this.value;
            if(validDate(submittedDate)) {
                model.getDataForWeekEnding(submittedDate);
            } else {
                alert(
                    "Please enter a valid date from 2010-01-01 through today " +
                    "in the form yyyy-m-d."
                );
                this.focus();
            }

        },

        updateChart = function updateChart(dataSeries) {
            refreshDataSeries(dataSeries);
            chart.redraw();
        },

        api = {
            init: init,
            initChart: initChart,
            showMessage: showMessage,
            hideMessage: hideMessage,
            getData: getData,
            updateChart: updateChart
        };

    app.view = api;
}((typeof app === 'undefined') ? {} : app));

/*
 * Model
 */
(function (app) {
    'use strict';

    var view = {},

        // Each data series will consist of 24 data points.
        emptyDataPoints = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ],

        // Categories used for chart.  The order of this array dictates the
        // order they will be displayed in the chart.  Order was calculated
        // manually for maximum visual interest (basically fatter stuff in the
        // middle).
        categories = [
            'Graffiti',
            'Homeless & Homeless Services',
            'Illegal Building Use',
            'Abandoned Vehicles',
            'Other/Miscellaneous',
            'Sewer Maintenance',
            'Agencies & Licensing',
            'Traffic Signal Conditions',
            'Blocked Driveway',
            'Water Maintenance',
            'General Construction/Plumbing',
            'Street Conditions',
            'Building Conditions',
            'Noise/Nuisance',
            'Heat/Hot Water',
            'Sanitary Conditions',
            'Streetlights',
            'Trees/Plants',
            'Housing Issues',
            'Illegal Parking',
            'Dirty Conditions',
            'Property Taxes',
            'Animals/Rodents',
            'Consumer Complaint',
            'Taxis/Transportation',
            'Sidewalk Conditions'
        ],

        // Manually created map to aggregate the data source's native
        // complaint_types (283 as of this writing) to a more manageable number
        // of categories (see categories above).
        categoriesMap = {
            "Derelict Bicycle":"Abandoned Vehicles",
            "Derelict Vehicle":"Abandoned Vehicles",
            "Derelict Vehicles":"Abandoned Vehicles",
            "AGENCY":"Agencies & Licensing",
            "Agency Issues":"Agencies & Licensing",
            "Benefit Card Replacement":"Agencies & Licensing",
            "DCA / DOH New License Application Request":"Agencies & Licensing",
            "DCA Literature Request":"Agencies & Licensing",
            "DEP Literature Request":"Agencies & Licensing",
            "DFTA Literature Request":"Agencies & Licensing",
            "Discipline and Suspension":"Agencies & Licensing",
            "DOE Complaint or Compliment":"Agencies & Licensing",
            "DOF Literature Request":"Agencies & Licensing",
            "DOF Parking - Address Update":"Agencies & Licensing",
            "DOF Parking - DMV Clearance":"Agencies & Licensing",
            "DOF Parking - Payment Issue":"Agencies & Licensing",
            "DOF Parking - Request Copy":"Agencies & Licensing",
            "DOF Parking - Request Status":"Agencies & Licensing",
            "DOF Parking - Tax Exemption":"Agencies & Licensing",
            "DOR Literature Request":"Agencies & Licensing",
            "DOT Literature Request":"Agencies & Licensing",
            "DPR Internal":"Agencies & Licensing",
            "DPR Literature Request":"Agencies & Licensing",
            "Forms":"Agencies & Licensing",
            "HEAP Assistance":"Agencies & Licensing",
            "Literature Request":"Agencies & Licensing",
            "OEM Literature Request":"Agencies & Licensing",
            "Open Flame Permit":"Agencies & Licensing",
            "Request for Information":"Agencies & Licensing",
            "Research Questions":"Agencies & Licensing",
            "Animal Abuse":"Animals/Rodents",
            "Animal Facility - No Permit":"Animals/Rodents",
            "Animal in a Park":"Animals/Rodents",
            "Harboring Bees/Wasps":"Animals/Rodents",
            "Illegal Animal Kept as Pet":"Animals/Rodents",
            "Illegal Animal Sold":"Animals/Rodents",
            "Rodent":"Animals/Rodents",
            "Trapping Pigeon":"Animals/Rodents",
            "Unleashed Dog":"Animals/Rodents",
            "Unlicensed Dog":"Animals/Rodents",
            "Blocked Driveway":"Blocked Driveway",
            "Asbestos":"Building Conditions",
            "Asbestos/Garbage Nuisance":"Building Conditions",
            "BEST/Site Safety":"Building Conditions",
            "Boilers":"Building Conditions",
            "Building Condition":"Building Conditions",
            "DOOR/WINDOW":"Building Conditions",
            "EAP Inspection - F59":"Building Conditions",
            "ELECTRIC":"Building Conditions",
            "Electrical":"Building Conditions",
            "ELEVATOR":"Building Conditions",
            "Elevator":"Building Conditions",
            "Emergency Response Team (ERT)":"Building Conditions",
            "Fire Alarm - Addition":"Building Conditions",
            "Fire Alarm - Modification":"Building Conditions",
            "Fire Alarm - New System":"Building Conditions",
            "Fire Alarm - Reinspection":"Building Conditions",
            "Fire Alarm - Replacement":"Building Conditions",
            "Fire Safety Director - F58":"Building Conditions",
            "FLOORING/STAIRS":"Building Conditions",
            "Forensic Engineering":"Building Conditions",
            "GENERAL":"Building Conditions",
            "Investigations and Discipline (IAD)":"Building Conditions",
            "Maintenance or Facility":"Building Conditions",
            "OUTSIDE BUILDING":"Building Conditions",
            "PAINT - PLASTER":"Building Conditions",
            "PAINT/PLASTER":"Building Conditions",
            "Plumbing":"Building Conditions",
            "PLUMBING":"Building Conditions",
            "School Maintenance":"Building Conditions",
            "Sprinkler - Mechanical":"Building Conditions",
            "Standpipe - Mechanical":"Building Conditions",
            "VACANT APARTMENT":"Building Conditions",
            "Weatherization":"Building Conditions",
            "Window Guard":"Building Conditions",
            "Beach/Pool/Sauna Complaint":"Consumer Complaint",
            "Bottled Water":"Consumer Complaint",
            "Cable Complaint":"Consumer Complaint",
            "Calorie Labeling":"Consumer Complaint",
            "Case Management Agency Complaint":"Consumer Complaint",
            "City Vehicle Placard Complaint":"Consumer Complaint",
            "Comment":"Consumer Complaint",
            "Complaint":"Consumer Complaint",
            "Compliment":"Consumer Complaint",
            "Consumer Complaint":"Consumer Complaint",
            "Foam Ban Enforcement":"Consumer Complaint",
            "Food Establishment":"Consumer Complaint",
            "Home Delivered Meal - Missed Delivery":"Consumer Complaint",
            "Home Delivered Meal Complaint":"Consumer Complaint",
            "Legal Services Provider Complaint":"Consumer Complaint",
            "Lifeguard":"Consumer Complaint",
            "Public Payphone Complaint":"Consumer Complaint",
            "Smoking":"Consumer Complaint",
            "Tanning":"Consumer Complaint",
            "Tattooing":"Consumer Complaint",
            "Trans Fat":"Consumer Complaint",
            "Dirty Conditions":"Dirty Conditions",
            "Gas Station Discharge Lines":"Dirty Conditions",
            "Industrial Waste":"Dirty Conditions",
            "Sweeping/Inadequate":"Dirty Conditions",
            "Sweeping/Missed":"Dirty Conditions",
            "Sweeping/Missed-Inadequate":"Dirty Conditions",
            "Vacant Lot":"Dirty Conditions",
            "CONSTRUCTION":"General Construction/Plumbing",
            "Construction":"General Construction/Plumbing",
            "Cranes and Derricks":"General Construction/Plumbing",
            "GENERAL CONSTRUCTION":"General Construction/Plumbing",
            "General Construction/Plumbing":"General Construction/Plumbing",
            "Interior Demo":"General Construction/Plumbing",
            "Scaffold Safety":"General Construction/Plumbing",
            "Stalled Sites":"General Construction/Plumbing",
            "Graffiti":"Graffiti",
            "HEAT/HOT WATER":"Heat/Hot Water",
            "HEATING":"Heat/Hot Water",
            "Non-Residential Heat":"Heat/Hot Water",
            "DHS Advantage - Tenant":"Homeless & Homeless Services",
            "DHS Advantage - Third Party":"Homeless & Homeless Services",
            "DHS Advantage -Landlord/Broker":"Homeless & Homeless Services",
            "DHS Income Savings Requirement":"Homeless & Homeless Services",
            "Homeless Encampment":"Homeless & Homeless Services",
            "Homeless Person Assistance":"Homeless & Homeless Services",
            "Eviction":"Housing Issues",
            "Home Repair":"Housing Issues",
            "Housing - Low Income Senior":"Housing Issues",
            "Housing Options":"Housing Issues",
            "HPD Literature Request":"Housing Issues",
            "NONCONST":"Housing Issues",
            "SCRIE":"Housing Issues",
            "Building/Use":"Illegal Building Use",
            "Illegal Parking":"Illegal Parking",
            "Traffic/Illegal Parking":"Illegal Parking",
            "Bike/Roller/Skate Chronic":"Noise/Nuisance",
            "Collection Truck Noise":"Noise/Nuisance",
            "Disorderly Youth":"Noise/Nuisance",
            "Drinking":"Noise/Nuisance",
            "Illegal Fireworks":"Noise/Nuisance",
            "Noise":"Noise/Nuisance",
            "Noise - Commercial":"Noise/Nuisance",
            "Noise - Helicopter":"Noise/Nuisance",
            "Noise - House of Worship":"Noise/Nuisance",
            "Noise - Park":"Noise/Nuisance",
            "Noise - Residential":"Noise/Nuisance",
            "Noise - Street/Sidewalk":"Noise/Nuisance",
            "Noise - Vehicle":"Noise/Nuisance",
            "Noise Survey":"Noise/Nuisance",
            "Panhandling":"Noise/Nuisance",
            "Squeegee":"Noise/Nuisance",
            "Alzheimer's Care":"Other/Miscellaneous",
            "Bereavement Support Group":"Other/Miscellaneous",
            "Bike Rack Condition":"Other/Miscellaneous",
            "Day Care":"Other/Miscellaneous",
            "Drinking Water":"Other/Miscellaneous",
            "Elder Abuse":"Other/Miscellaneous",
            "Food Poisoning":"Other/Miscellaneous",
            "Found Property":"Other/Miscellaneous",
            "Health":"Other/Miscellaneous",
            "Healthcare Facilities":"Other/Miscellaneous",
            "Home Care Provider Complaint":"Other/Miscellaneous",
            "Invitation":"Other/Miscellaneous",
            "Laboratory":"Other/Miscellaneous",
            "Lost Property":"Other/Miscellaneous",
            "Meals Home Delivery Required":"Other/Miscellaneous",
            "Micro Switch":"Other/Miscellaneous",
            "Misc. Comments":"Other/Miscellaneous",
            "Miscellaneous Categories":"Other/Miscellaneous",
            "Municipal Parking Facility":"Other/Miscellaneous",
            "No Child Left Behind":"Other/Miscellaneous",
            "Non-Emergency Police Matter":"Other/Miscellaneous",
            "NORC Complaint":"Other/Miscellaneous",
            "OEM Disabled Vehicle":"Other/Miscellaneous",
            "Parent Leadership":"Other/Miscellaneous",
            "Parking Card":"Other/Miscellaneous",
            "Portable Toilet":"Other/Miscellaneous",
            "Posting Advertisement":"Other/Miscellaneous",
            "Public Assembly":"Other/Miscellaneous",
            "Public Assembly - Temporary":"Other/Miscellaneous",
            "Public Toilet":"Other/Miscellaneous",
            "Radioactive Material":"Other/Miscellaneous",
            "Rangehood":"Other/Miscellaneous",
            "Recycling Enforcement":"Other/Miscellaneous",
            "Registration and Transfers":"Other/Miscellaneous",
            "Request Xmas Tree Collection":"Other/Miscellaneous",
            "Safety":"Other/Miscellaneous",
            "SAFETY":"Other/Miscellaneous",
            "Senior Center Complaint":"Other/Miscellaneous",
            "SG-99":"Other/Miscellaneous",
            "Special Enforcement":"Other/Miscellaneous",
            "Special Natural Area District (SNAD)":"Other/Miscellaneous",
            "Special Projects Inspection Team (SPIT)":"Other/Miscellaneous",
            "Summer Camp":"Other/Miscellaneous",
            "Teaching/Learning/Instruction":"Other/Miscellaneous",
            "Unspecified":"Other/Miscellaneous",
            "Utility Program":"Other/Miscellaneous",
            "Vending":"Other/Miscellaneous",
            "Violation of Park Rules":"Other/Miscellaneous",
            "X-Ray Machine/Equipment":"Other/Miscellaneous",
            "Advocate - Other":"Property Taxes",
            "Advocate - RPIE":"Property Taxes",
            "Advocate-Co-opCondo Abatement":"Property Taxes",
            "Advocate-Commercial Exemptions":"Property Taxes",
            "Advocate-Personal Exemptions":"Property Taxes",
            "Advocate-Prop Class Incorrect":"Property Taxes",
            "Advocate-Prop Refunds/Credits":"Property Taxes",
            "Advocate-Property Value":"Property Taxes",
            "Advocate-SCRIE/DRIE":"Property Taxes",
            "Advocate-UBT":"Property Taxes",
            "DOF Property - City Rebate":"Property Taxes",
            "DOF Property - Owner Issue":"Property Taxes",
            "DOF Property - Payment Issue":"Property Taxes",
            "DOF Property - Property Value":"Property Taxes",
            "DOF Property - Reduction Issue":"Property Taxes",
            "DOF Property - Request Copy":"Property Taxes",
            "DOF Property - RPIE Issue":"Property Taxes",
            "DOF Property - State Rebate":"Property Taxes",
            "DOF Property - Update Account":"Property Taxes",
            "Taxpayer Advocate Inquiry":"Property Taxes",
            "Adopt-A-Basket":"Sanitary Conditions",
            "Air Quality":"Sanitary Conditions",
            "APPLIANCE":"Sanitary Conditions",
            "Hazardous Materials":"Sanitary Conditions",
            "Hazmat Storage/Use":"Sanitary Conditions",
            "Indoor Air Quality":"Sanitary Conditions",
            "Indoor Sewage":"Sanitary Conditions",
            "Lead":"Sanitary Conditions",
            "Litter Basket / Request":"Sanitary Conditions",
            "Missed Collection (All Materials)":"Sanitary Conditions",
            "Mold":"Sanitary Conditions",
            "Mosquitoes":"Sanitary Conditions",
            "Other Enforcement":"Sanitary Conditions",
            "Overflowing Litter Baskets":"Sanitary Conditions",
            "Overflowing Recycling Baskets":"Sanitary Conditions",
            "Sanitation Condition":"Sanitary Conditions",
            "SRDE":"Sanitary Conditions",
            "Unsanitary Animal Facility":"Sanitary Conditions",
            "Unsanitary Animal Pvt Property":"Sanitary Conditions",
            "UNSANITARY CONDITION":"Sanitary Conditions",
            "Unsanitary Pigeon Condition":"Sanitary Conditions",
            "Urinating in Public":"Sanitary Conditions",
            "Sewer":"Sewer Maintenance",
            "Curb Condition":"Sidewalk Conditions",
            "Root/Sewer/Sidewalk Condition":"Sidewalk Conditions",
            "Sidewalk Condition":"Sidewalk Conditions",
            "Bridge Condition":"Street Conditions",
            "Broken Muni Meter":"Street Conditions",
            "Broken Parking Meter":"Street Conditions",
            "Highway Condition":"Street Conditions",
            "Highway Sign - Damaged":"Street Conditions",
            "Highway Sign - Dangling":"Street Conditions",
            "Highway Sign - Missing":"Street Conditions",
            "Snow":"Street Conditions",
            "SNW":"Street Conditions",
            "Street Condition":"Street Conditions",
            "Street Sign - Dangling":"Street Conditions",
            "Street Sign - Missing":"Street Conditions",
            "Tunnel Condition":"Street Conditions",
            "Street Light Condition":"Streetlights",
            "Bus Stop Shelter Placement":"Taxis/Transportation",
            "Ferry Complaint":"Taxis/Transportation",
            "Ferry Inquiry":"Taxis/Transportation",
            "Ferry Permit":"Taxis/Transportation",
            "For Hire Vehicle Complaint":"Taxis/Transportation",
            "For Hire Vehicle Report":"Taxis/Transportation",
            "Taxi Complaint":"Taxis/Transportation",
            "Taxi Compliment":"Taxis/Transportation",
            "Taxi Report":"Taxis/Transportation",
            "Transportation Provider Complaint":"Taxis/Transportation",
            "Street Sign - Damaged":"Traffic Signal Conditions",
            "Traffic":"Traffic Signal Conditions",
            "Traffic Signal Condition":"Traffic Signal Conditions",
            "Damaged Tree":"Trees/Plants",
            "Dead Tree":"Trees/Plants",
            "Dead/Dying Tree":"Trees/Plants",
            "Illegal Tree Damage":"Trees/Plants",
            "New Tree Request":"Trees/Plants",
            "Overgrown Tree/Branches":"Trees/Plants",
            "Plant":"Trees/Plants",
            "Poison Ivy":"Trees/Plants",
            "Standing Water":"Water Maintenance",
            "STRUCTURAL":"Water Maintenance",
            "Water Conservation":"Water Maintenance",
            "WATER LEAK":"Water Maintenance",
            "Water Quality":"Water Maintenance",
            "Water System":"Water Maintenance"
        },

        // Array of data series, initially with empty data points.
        emptyDataSeries = function emptyDataSeries(categories) {
            return categories.map(function(category) {
                return {
                    name: category,
                    data: [].concat(emptyDataPoints)
                };
            });
        },

        // This data series will be used to create the floating area effect.
        emptyOffsetSeries = function emptyOffsetSeries() {
            return {
                data: [].concat(emptyDataPoints),
                showInLegend: false,
                fillColor: 'rgba(0,0,0,0)'
            };
        },

        // Object literal that inverts the key (index)/value pairs of the
        // categories array.  I use this to map complaint_types in the result
        // set to their proper category by index without having to call
        // '.indexOf()' 35,000 times for every result set. :)
        categoryIndexMap = categories.reduce(function(indexes, category, i) {
            indexes[category] = i;
            return indexes;
        }, {}),

        oneDay = 24 * 60 * 60 * 1000,

        startDate = function startDate(datetime) {
            var startDate = new Date(datetime.getTime() - (oneDay * 6));
            return startDate.toJSON().slice(0,-1);
        },

        endDate = function endDate(datetime) {
            var endDate = new Date(datetime.getTime() + oneDay);
            return endDate.toJSON().slice(0,-1);
        },

        dataResourceURL = "https://data.cityofnewyork.us/resource/fhrw-4uyv.json",

        queryString = function queryString(date) {
            var datetime = new Date(date),
                selectClause = "$select=complaint_type, created_date, " +
                    "date_trunc_ymd(created_date) as date",
                whereClause = "&$where= date >= '" + startDate(datetime) +
                    "' AND " + "date < '" + endDate(datetime) + "'",
                limitClause = "&$limit=100000";

            return "?" + [selectClause, whereClause, limitClause].join('&');
        },

        // Since new complaint_types can be added at any time, any unknown
        // complaint_types are mapped to "Other/Miscellaneous"
        getCategory = function getCategory(complaintType) {
            var category = categoriesMap[complaintType];

            if(typeof category === "undefined") {
                category = "Other/Miscellaneous";
            }

            return category;
        },

        // maxChartHeight is set higher than maxDataHeight to prevent the chart
        // from touching the x-axis.
        calculateOffset = function calculateOffset(offsetData) {
            var maxDataHeight = Math.max.apply(null, OffsetData),
                maxChartHeight = maxDataHeight * 1.2;

            return offsetData.map(function(hourlyDataHeight) {
                return (maxChartHeight - hourlyDataHeight) / 2.0;
            });
        },

        dataResourceError = function dataResourceError(jqxhr, status, error) {
            view.hideMessage();
            var errorText = status + "," + error;
            alert("Unable to obtain call data:\n" + errorText);
        },

        parseData = function parseData(callData) {
            view.showMessage("Parsing data . . .");

            var dataSeries = emptyDataSeries(categories),
                dummyOffset = emptyOffsetSeries();

            callData.forEach(function(complaint) {
                var category = getCategory(complaint.complaint_type),
                    hour = parseInt(complaint.created_date.slice(11, 13));
                    index = categoryIndexMap[category];
                dataSeries[index].data[hour]++;
                dummyOffset.data[hour]++;
            });

            dummyOffset.data = calculateOffset(dummyOffset.data);
            dataSeries.push(dummyOffset);

            view.hideMessage;
            view.updateChart(dataSeries);
        },

        init = function init(appView) {
            view = appView;
        },

        getDataForWeekEnding = function getDataForWeekEnding(date) {
            view.showMessage("Requesting 311 call data . . .");
            var resourceURI = dataResourceURL + queryString(date);
            $.getJSON(resourceURI)
                .done(parseData)
                .fail(dataResourceError);
        },
            // $.getJSON(,
            //     function (response) {
            //         response.forEach(function(complaint) {
            //             if(complaint['created_date'].slice(11) != "00:00:00.000") {
            //                 var category = categoriesMap[complaint['complaint_type']];
            //                 var hour = parseInt(complaint['created_date'].slice(11, 13));
            //                 var index = categoryIndexMap[category];
            //                 returnDataSeries[index].data[hour]++;
            //                 dummyOffsetSeries.data[hour]++;
            //             }
            //         });
            //         max = Math.max.apply(null, dummyOffset.data) * 1.2;
            //         dummyOffset.data = dummyOffset.data.map(function(datum) { return (max - datum) / 2.0 });
            //         series.push(dummyOffsetSeries);
            //         options.series = series;
            //         $('#container').highcharts(options);
            //     }
            // );

        api = {
          init: init,
          getDataForWeekEnding: getDataForWeekEnding
        };

    app.model = api;
}((typeof app === 'undefined') ? {} : app));

/*
 * App
 */
(function () {
    'use strict';

    var threeOneOne = Object.create(null);

    threeOneOne.view = Object.create(app.view);
    threeOneOne.model = Object.create(app.model);
    threeOneOne.view.init(threeOneOne.model);
    threeOneOne.model.init(threeOneOne.view);

    $(function() {
        threeOneOne.view.initChart('container');
        $('#date-select').change(threeOneOne.view.getData);
        $('#date-select').change();
    });
})();

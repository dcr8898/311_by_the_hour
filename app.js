$(function () {
    $('#container').highcharts({
        chart: {
            type: 'areaspline'
        },
        colors: [
            '#abf19d',
            '#9cc7f0',
            '#f8b984',
            'rgba(0,0,0,0)'
        ],
        title: {
            text: 'Average fruit consumption during one week'
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 1,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        xAxis: {
            categories: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ],
            plotBands: [{ // visualize the weekend
                from: 4.5,
                to: 6.5,
                color: 'rgba(68, 170, 213, .2)'
            }]
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
            name: 'Joe',
            data: [1, 3, 4, 3, 3, 6, 4]
        }, {
            name: 'John',
            data: [3, 4, 3, 5, 4, 10, 12]
        }, {
            name: 'Jane',
            data: [1, 3, 4, 4, 3, 5, 4]
        }, {
            showInLegend: false,
            showInTooltip: false,
            name: 'dummyOffset',
            data: [8.5, 6, 5.5, 5, 6, 0.5, 1]
        }]
    });
});

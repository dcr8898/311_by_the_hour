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
                '12 AM', '01 AM', '02 AM', '03 AM', '04 AM', '05 AM', '06 AM',
                '07 AM', '08 AM', '09 AM', '10 AM', '11 AM', '12 PM', '01 PM',
                '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM',
                '09 PM', '10 PM', '11 PM', '12 AM'
            ],
            labels: {
                formatter: function() {
                    switch(this.value.slice(0,2)) {
                        case '01':  return '&#x1f550';
                        case '02':  return '&#x1f551';
                        case '03':  return '&#x1f552';
                        case '04':  return '&#x1f553';
                        case '05':  return '&#x1f554';
                        case '06':  return '&#x1f555';
                        case '07':  return '&#x1f556';
                        case '08':  return '&#x1f557';
                        case '09':  return '&#x1f558';
                        case '10':  return '&#x1f559';
                        case '11':  return '&#x1f55a';
                        case '12':  return '&#x1f55b';
                    }
                },
                useHTML: true
            },
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
            name: 'Joe',
            data: [1, 2, 6, 3, 3, 10, 4]
        }, {
            name: 'John',
            data: [3, 8, 3, 2, 4, 6, 6]
        }, {
            name: 'Jane',
            data: [1, 5, 4, 4, 5, 5, 4]
        }, {
            showInLegend: false,
            showInTooltip: false,
            name: 'dummyOffset',
            data: [8.5, 3.5, 4.5, 6.5, 5, 0.5, 4]
        }]
    });
});

"use strict";

var plot = function plot(data, elm, title, ysample, key, line) {
  return $(elm).highcharts({
    colors: [line],
    chart: {
      type: 'spline'
    },
    title: {
      text: title
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: ysample
      }
    },
    series: [{
      name: title,
      data: _.map(data, function (row) {
        var date = new Date(row.datetime);
        return [date, row[key]];
      })
    }]
  });
};

$.get('https://raw.githubusercontent.com/yasuharu519/Weight/master/data.jsonl').done(function (data) {
  var parsed = data.trim().split('\n').map(function (d) {
    var parsed = JSON.parse(d);

    if (parsed.fat) {
      parsed.fat = parsed.fat / parsed.weight * 100;
    }

    parsed.bmi = parsed.weight / 1.78 / 1.78;
    return parsed;
  });
  plot(parsed, '#weight', 'Weight', 'Weight (kg)', 'weight', '#7cb5ec');
  plot(parsed, '#fat', 'Fat', '(%)', 'fat', '#827eef');
  plot(parsed, '#bmi', 'BMI', '(score)', 'bmi', '#d180f2');
});
//# sourceMappingURL=index.js.map

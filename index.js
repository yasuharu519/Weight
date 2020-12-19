(function() {
  var plot;

  plot = function(yasuharu, elm, title, ysample, key, line) {
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
      series: [
        {
          name: title,
          data: _.map(yasuharu.data,
        function(row) {
            var date;
            date = row.datetime.split(' ')[0].split('/');
            return [Date.UTC(date[0],
        date[1] - 1,
        date[2]),
        row[key]];
          })
        }
      ]
    });
  };

  $.getJSON('https://raw.githubusercontent.com/yasuharu519/Weight/master/data.json').done(function(yasuharu) {
    plot(yasuharu, '#weight', 'Weight', 'Weight (kg)', 'weight', '#7cb5ec');
    plot(yasuharu, '#fat', 'Fat', '(%)', 'fat', '#827eef');
    return plot(yasuharu, '#bmi', 'BMI', '(score)', 'bmi', '#d180f2');
  });

}).call(this);
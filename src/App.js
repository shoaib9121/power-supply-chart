import React, { useState } from "react";
import { graphic } from "echarts";
import ReactECharts from "echarts-for-react";
import { fetchData } from "./service";
import { colorMap } from "./constants";

function App() {
  const [data, setData] = useState([]);
  const [option, setOption] = useState(null);
  const [yAxisData, setYAxisData] = useState([]);
  const [weekData, setWeekData] = useState({});

  const renderItem = (params, api) => {
    let categoryIndex = api.value(0);
    let start = api.coord([api.value(1), categoryIndex]);
    let end = api.coord([api.value(2), categoryIndex]);
    let height = api.size([0, 1])[1] * 0.6;
    let rectShape = graphic.clipRectByRect(
      {
        x: start[0],
        y: start[1] - height / 2,
        width: end[0] - start[0],
        height: height,
      },
      {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height,
      }
    );
    return (
      rectShape && {
        type: "rect",
        transition: ["shape"],
        shape: rectShape,
        style: api.style(),
      }
    );
  };

  React.useEffect(() => {
    if (Object.entries(weekData).length) {
      setYAxisData(Object.keys(weekData));
      const dataPoints = [];
      Object.entries(weekData).forEach((day, rowIndex) => {
        let dayItem = day[1];
        if (dayItem) {
          dayItem.forEach((timeItem, colIndex) => {
            const date = new Date(timeItem.minute_window);
            const options = {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            };
            dataPoints.push({
              name: timeItem.sourceTag,
              timeStamp: date.toLocaleString("en-us", options),
              value: getDataPointValue(rowIndex, colIndex, date),
              itemStyle: {
                normal: {
                  color: getColor(date, timeItem, rowIndex, colIndex),
                },
              },
            });
          });
        }
      });
      setData(dataPoints);
    }
  }, [weekData]);

  const getDataPointValue = (y, x, date) => {
    return [y, x, date.getTime(), 0];
  };

  const getColor = (date, item, rowIndex, colIndex) => {
    const dataPoint = weekData[Object.keys(weekData)[rowIndex]];
    const pDate =
      colIndex === 0
        ? new Date(dataPoint[colIndex].minute_window).getTime()
        : new Date(dataPoint[colIndex - 1].minute_window).getTime();
    const cDate = date.getTime();
    const diff = Math.abs(cDate - pDate) / 1000 / 60;
    return diff <= 5 ? colorMap[item.sourceTag] : colorMap.White;
  };

  React.useEffect(() => {
    fetchData().then((data) => {
      const weekHashMap = {};
      data.forEach((item) => {
        if (weekHashMap.hasOwnProperty(item.date)) {
          weekHashMap[item.date].push(item);
        } else {
          weekHashMap[item.date] = [item];
        }
      });
      setWeekData(weekHashMap);
    });
  }, []);

  React.useEffect(() => {
    if (data.length) {
      setOption({
        tooltip: {
          formatter: function (params) {
            const { color, name } = params;
            return `<div style="background-color:${color}; padding: 10px;">
                      <div>${name} ${params.data.timeStamp}</div>
                    </div>`;
          },
        },
        grid: { height: 300 },
        xAxis: {
          max: 288,
          // scale: true,
          type: "value",
          axisLabel: {
            formatter: function (val) {
              return val;
            },
          },
        },
        yAxis: { type: "category", data: yAxisData },
        series: [
          {
            name: "Power Source",
            type: "custom",
            renderItem: renderItem,
            itemStyle: {
              opacity: 0.8,
            },
            data: data,
            label: {
              show: true,
            },
          },
        ],
      });
    }
  }, [data, weekData]);

  return (
    <div className="App">
      {data.length > 0 && option && (
        <ReactECharts option={option} style={{ width: "100%", height: "400px" }} />
      )}
    </div>
  );
}

export default App;

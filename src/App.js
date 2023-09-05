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

  const getTime = (x,y, date) => {
    return [x,y,date.getTime(), 0]
  }

  React.useEffect(() => {
    if (Object.entries(weekData).length) {
      setYAxisData(Object.keys(weekData));
    }
  }, [weekData]);

  React.useEffect(() => {
    fetchData().then((data) => {
      const tempData = [];
      data.forEach((item) => {
        if (weekData.hasOwnProperty(item.date)) {
          weekData[item.date].push(item);
        } else {
          weekData[item.date] = [item];
        }
      });
      setWeekData(weekData);

      Object.entries(weekData).forEach((day, rowIndex) => {
        let dayItem = day[1];
        if (dayItem) {
          dayItem.forEach((timeItem, xIndex) => {
            tempData.push({
              name: timeItem.sourceTag,
              timeStamp: new Date(timeItem.minute_window).toLocaleString(),
              value: getTime(xIndex, rowIndex, new Date(timeItem.minute_window)), // check if index passed correctly
              itemStyle: {
                normal: {
                  color: colorMap[timeItem.sourceTag],
                },
              },
            });
          });
        }
      });
      console.log("tempData", tempData);
      setData(tempData);
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
          // scale: true,
          type: "value",
          // axisLabel: {
          //   formatter: `{mm}-{ss}`,
          // },
        },
        yAxis: { data: yAxisData },
        series: [
          {
            name: "Power Source",
            type: "custom",
            renderItem: renderItem,
            itemStyle: {
              opacity: 0.8,
            },
            // encode: {
            //   x: [1, 2],
            //   y: 0,
            // },
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

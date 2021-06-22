<script>
  import { Line } from "vue-chartjs";
  import "chartjs-plugin-streaming";
  import { cpuPercentage } from '@/request/ips/IpsManagerRequest';
  import { isEmpty, reduce } from 'lodash';

  export default {
    name: "CPUPercent",
    extends: Line,
    mounted() {
      this.renderChart(
      {
        datasets: [
        {
          label: this.$t("monitor.cpuHistory"),
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)"
        }
        ]
      },
      {
        maintainAspectRatio: false,
        scales: {
          xAxes: [
          {
            type: "realtime",
            realtime: {
              duration: 50000,
              refresh: 5000,
              delay: 1000,
              onRefresh: this.onRefresh
            }
          }
          ],
          yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "percent"
            },
            ticks: {
              min: 0
            }
          }
          ]
        },
        tooltips: {
          mode: "nearest",
          intersect: false
        },
        hover: {
          mode: "nearest",
          intersect: false
        }
      }
      );
    },
    methods: {
      onRefresh(chart) {
        cpuPercentage().then(response => {
          if (!isEmpty(response.data.data)) {
            chart.data.datasets.forEach(dataset => {
              dataset.data.push({
                x: Date.now(),
                y: this.arrayAvg(response.data.data)
              });
            });
          }
        });
      },
      arrayAvg(array) {
        const avg = reduce(array, (a, b) => a + b, 0) / array.length;
        return Math.round(avg * 100) / 100;
      }
    }
  };
</script>

<style lang="scss" scoped>
  #line-chart {
    height: 400px!important;
  }
</style>

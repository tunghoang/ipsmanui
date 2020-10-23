<template>
  <div class="dashboard-editor-container">
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <h1>
        Hệ thống quản trị NetIPS và HostIPS - IPSManager
      </h1>
      <h4>
        được nghiên cứu xây dựng trong khuôn khổ đề tài cấp
        nhà nước mã số KC.01.28/16-20, thuộc Chương trình
        Khoa học và Công nghệ trọng điểm cấp quốc gia
        KC.01/16-20.
      </h4>
      <hr class="my-4" />
      <p>
        Trong đề tài này, chúng tôi hướng đến thực hiện hai
        mục tiêu đã xác lập trong đặt hàng của Bộ Khoa học
        và Công nghệ, cụ thể như sau:
      </p>
      <p>
        1. Làm chủ giải pháp kỹ thuật, công nghệ thiết kế, chế tạo thiết bị phát hiện, phòng chống xâm nhập mạng nội bộ (NetIPS), phát hiện và phòng chống xâm nhập máy chủ (HostIPS), quản trị các NetIPS và HostIPS (IPS Manager).
      </p>
      <p>
        2. Chế tạo, triển khai thử nghiệm thiết bị tại cơ quan quản lý nhà nước phục vụ hoạt động của Chính phủ điện tử.
      </p>
      <p> Hai mục tiêu chính này bao gồm các mục tiêu cụ thể sau: </p>

      <p> i.  Xác định được công nghệ thiết kế, tích hợp để hình thành các thiết bị phần cứng để hình thành thiết bị có chức năng phát hiện và phòng chống xâm nhập mạng nội bộ (NetIPS) </p>
      <p> ii. Làm chủ được phương pháp, kỹ thuật hiện đại trong lĩnh vực phát hiện và phòng chống xâm nhập, từ đó xây dựng, cài đặt thành các hệ thống NetIPS và phần mềm HostIPS.</p>
      <p> iii.  Thiết kế và xây dựng hệ thống IPS Manager quản lý toàn bộ các thiết bị phát hiện, phòng chống xâm nhập mạng nội bộ NetIPS và phần mềm phát hiện, phòng chống xâm nhập máy chủ HostIPS.</p>
      <p> iv. Đánh giá thử nghiệm (i) thiết bị phát hiện, phòng chống xâm nhập mạng nội bộ NetIPS, (ii) phần mềm phát hiện, phòng chống xâm nhập máy chủ HostIPS, và (iii) hệ thống quản lý IPS Manager tại 01 cơ quan cấp Bộ và 01 Tỉnh/Thành phố trực thuộc trung ương.</p>

      <hr class="my-4" />
      <p>
        Đơn vị chủ trì: Trường Đại học Công nghệ - Đại học
        Quốc gia Hà Nội
      </p>
      <p>
        Các đơn vị phối hợp:
        <br />&emsp;&emsp; 1. Viện Công nghệ thông tin và Truyền thông, Trường Đại học Bách khoa Hà Nội
        <br />&emsp;&emsp; 2. Viện 10  – Bộ tư lệnh 86, Bộ Quốc Phòng
        <br />&emsp;&emsp; 3. Trung Tâm Công nghệ thông tin, Bộ Giao thông Vận tải
        <br />&emsp;&emsp; 4. Trung tâm Tin học – Công báo Hà Nội, UBND TP Hà Nội
      </p>
    </el-row>
  </div>
</template>

<script>

export default {
  name: 'DashboardAdmin',
  data() {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>

<template>
  <div class="app-container documentation-container">
    <el-row style="background: #4dbd74; padding:16px 16px 0; margin-bottom:32px; color: #ffffff">
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
    <dropdown-menu :items="articleList" style="float:left;margin-left:50px;" title="系列文章" />
  </div>
</template>

<script>
import DropdownMenu from '@/components/Share/DropdownMenu'

export default {
  name: 'Documentation',
  components: { DropdownMenu },
  data() {
    return {
      articleList: [
        { title: '基础篇', href: 'https://juejin.im/post/59097cd7a22b9d0065fb61d2' },
        { title: '登录权限篇', href: 'https://juejin.im/post/591aa14f570c35006961acac' },
        { title: '实战篇', href: 'https://juejin.im/post/593121aa0ce4630057f70d35' },
        { title: 'vue-admin-template 篇', href: 'https://juejin.im/post/595b4d776fb9a06bbe7dba56' },
        { title: 'v4.0 篇', href: 'https://juejin.im/post/5c92ff94f265da6128275a85' },
        { title: '自行封装 component', href: 'https://segmentfault.com/a/1190000009090836' },
        { title: '优雅的使用 icon', href: 'https://juejin.im/post/59bb864b5188257e7a427c09' },
        { title: 'webpack4（上）', href: 'https://juejin.im/post/59bb864b5188257e7a427c09' },
        { title: 'webpack4（下）', href: 'https://juejin.im/post/5b5d6d6f6fb9a04fea58aabc' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.documentation-container {
  margin: 12px;
  display: flex;
  flex-wrap: wrap;
  .document-btn {
    margin-left: 50px;
    display: block;
    cursor: pointer;
    background: black;
    color: white;
    height: 60px;
    width: 200px;
    margin-bottom: 16px;
    line-height: 60px;
    font-size: 20px;
    text-align: center;
  }
}
</style>

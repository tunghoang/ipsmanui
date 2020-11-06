<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="device!=='mobile'" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />
      </template>

      <error-log class="errLog-container right-menu-item hover-effect" />

      <screenfull id="screenfull" class="right-menu-item hover-effect" />

      <el-tooltip :content="$t('Global Size')" effect="dark" placement="bottom">
        <size-select id="size-select" class="right-menu-item hover-effect" />
      </el-tooltip>
      <lang-select class="right-menu-item hover-effect" />

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <!-- <img :src="user.avatar+'?imageView2/1/w/80/h/80'" class="user-avatar"> -->
          <svg-icon class-name="user-icon user-avatar" icon-class="user" />
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/profile">
            <el-dropdown-item>
              {{ $t('navbar.profile') }}
            </el-dropdown-item>
          </router-link>
          <router-link to="/">
            <el-dropdown-item>
              {{ $t('navbar.dashboard') }}
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">{{ $t('navbar.logOut') }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import ErrorLog from '@/components/ErrorLog'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import LangSelect from '@/components/LangSelect'
import AuthenticationUtils from 'common/AuthenticationUtils'
import rf from 'requestfactory'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    ErrorLog,
    LangSelect,
    Screenfull,
    SizeSelect,
    Search
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'user',
      'device'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await rf.getRequest('AuthRequest').logout()
      await AuthenticationUtils.logout();
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 2px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 20px;
          height: 20px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>

<template>
  <div class="login-container">
    <el-form ref="loginForm" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">{{ $t('ExamReg Login') }}</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <i class="icon-user"></i>
        </span>
        <el-input
          ref="username"
          v-model="username"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
          @focus="resetError"
          :placeholder="$t('auth.username')"
          :class="{ error: errors.has('username') }"
          data-vv-validate-on="none"
          v-validate="'required'"
        />
        <div class="el-form-item__error" v-if="errors.has('username')">
          {{ errors.first('username') }}
        </div>
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <i class="icon-lock"></i>
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="password"
            :type="passwordType"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
            @focus="resetError"
            :placeholder="$t('auth.password')"
            :class="{ error: errors.has('password') }"
            data-vv-validate-on="none"
          />
          <span class="show-pwd" @click="showPwd">
            <i :class="passwordType === 'password' ? 'icon-eye' : 'icon-eye-open'" />
          </span>
          <div class="el-form-item__error" v-if="errors.has('password')">
            {{ errors.first('password') }}
          </div>
        </el-form-item>
      </el-tooltip>

      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">{{ $t('auth.login') }}</el-button>

      <div style="position:relative">
        <div class="tips">
<!--           <span>{{ $t('auth.username') }} : xxxxxxxx</span>
          <span>{{ $t('auth.password') }} : ******</span> -->
        </div>

<!--         <el-button class="thirdparty-button" type="primary" @click="showDialog=true">
  {{ $t('auth.orConnectWith') }}
</el-button> -->
      </div>
    </el-form>

    <el-dialog title="Or connect with" :visible.sync="showDialog">
      Can not be simulated on local, so please combine you own business simulation! ! !
      <br>
      <br>
      <br>
<!--       <social-sign /> -->
    </el-dialog>
  </div>
</template>

<script>
// import { validUsername } from '@/utils/validate'
// import SocialSign from './components/SocialSignin'
import { Message } from 'element-ui'
import rf from 'requestfactory';
import AuthenticationUtils from 'common/AuthenticationUtils';

export default {
  name: 'Login',
  data() {
    return {
      username: 'otto.gislason@example.org',
      password: '11563516',
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.username === '') {
      this.$refs.username.focus()
    } else if (this.password === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    openLoading() {
      this.isSubmitting = true
      setTimeout(() => {
        this.isSubmitting = false
      }, 10 * 1000)
    },
    resetError () {
      this.errors.clear();
    },
    checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if (shiftKey && (key >= 'a' && key <= 'z') || !shiftKey && (key >= 'A' && key <= 'Z')) {
          this.capsTooltip = true
        } else {
          this.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        this.capsTooltip = false
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    async handleLogin() {
      // await this.$validator.validateAll();
      // if (this.errors.any() || this.isSubmitting) {
      //   return;
      // }
      this.resetError();
      this.startSubmit();
      this.loading = true
      // debugger
      rf.getRequest('UserRequest').login(this.username, this.password)
      .then(response => {
        this.endSubmit();
        this.loading = false
        AuthenticationUtils.login(response);
        const destination = this.$route.query.destination || '/';
        this.$router.push({ path: destination });
      })
      .catch(error => {
        this.endSubmit();
        this.loading = false
        this.errors.add({field: 'error', msg: error.response.data.message});
        Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
      });
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
    // afterQRScan() {
    //   if (e.key === 'x-admin-oauth-code') {
    //     const code = getQueryObject(e.newValue)
    //     const codeMap = {
    //       wechat: 'code',
    //       tencent: 'code'
    //     }
    //     const type = codeMap[this.auth_type]
    //     const codeName = code[type]
    //     if (codeName) {
    //       this.$store.dispatch('LoginByThirdparty', codeName).then(() => {
    //         this.$router.push({ path: this.redirect || '/' })
    //       })
    //     } else {
    //       alert('第三方登录失败')
    //     }
    //   }
    // }
  }
}
</script>

<style lang="scss">
.particles-js-canvas-el {
  position: absolute;
}
$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
    .el-form-item__content {
      line-height: 30px;
    }
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 15px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: -10px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
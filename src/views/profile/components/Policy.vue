<template>
  <el-form>
    <el-form-item :label="`${$t('user.oldPassword')}`">
      <el-input v-model.trim="oldPassword" 
                show-password
                tabindex="1"
                name="oldPassword"
                @focus="resetError"
                :placeholder="$t('auth.oldPassword')"
                :class="{ error: errors.has('oldPassword') }"
                data-vv-validate-on="none"
                v-validate="'required'"/>
        <div class="el-form-item__error" v-if="errors.has('oldPassword')">
          {{ errors.first('oldPassword') }}
        </div>
    </el-form-item>
    <el-form-item :label="`${$t('user.newPassword')}`">
      <el-input v-model.trim="newPassword"
                show-password
                tabindex="2"
                ref="newPassword"
                name="newPassword"
                @focus="resetError"
                :placeholder="$t('auth.usernewPasswordname')"
                :class="{ error: errors.has('newPassword') }"
                data-vv-validate-on="none"
                v-validate="'required|min:6'"/>
        <div class="el-form-item__error" v-if="errors.has('newPassword')">
          {{ errors.first('newPassword') }}
        </div>
    </el-form-item>
    <el-form-item :label="`${$t('user.confirmPassword')}`">
      <el-input v-model.trim="confirmPassword" 
                show-password
                name="confirmPassword"
                tabindex="3"
                @focus="resetError"
                :placeholder="$t('auth.confirmPassword')"
                :class="{ error: errors.has('confirmPassword') }"
                data-vv-validate-on="none"
                v-validate="'required|confirmed:newPassword|min:6'"/>
      <div class="el-form-item__error" v-if="errors.has('confirmPassword')">
        {{ errors.first('confirmPassword') }}
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" tabindex="4" @click="submit">{{ $t('action.update') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import RemoveErrorsMixin from 'common/RemoveErrorsMixin';
  import rf from 'requestfactory'
  import { Message } from 'element-ui'
  export default {
    data() {
      return {
        newPassword: null,
        oldPassword: null,
        confirmPassword: null
      }
    },
    mixins: [RemoveErrorsMixin],
    methods: {
      async submit() {
        await this.$validator.validate('newPassword');
        await this.$validator.validate('oldPassword');
        await this.$validator.validate('confirmPassword');
        if (this.errors.any() || this.isSubmitting) {
          return;
        }
        let params = {
          newPassword: this.newPassword,
          oldPassword: this.oldPassword,
          confirmPassword: this.confirmPassword
        }
        rf.getRequest('AuthRequest').changePassword(params)
        .then(async() => {
          this.$notify({
            title: this.$t('notify.success.label'),
            message: this.$t('notify.success.updateSuccess'),
            type: 'success',
            duration: 1000,
            showClose: false
          })
        })
        .catch(error => {
          if(error.response.status == 403) {
            return Message.error(this.$t(error.response.data.message))
          }
          this.handleError(error)
        });
      },
      resetForm() {
        this.newPassword = null
        this.oldPassword = null
        this.confirmPassword = null
      },
      handleError(error) {
        this.convertRemoteErrors(error);
        if (this.errors.has('error')) {
          this.errors.add({field: 'error', msg: error.response.data.message});
          Message.error(this.$t(this.errors.first('error')) || this.$t('auth.unknowError'))
        }
      },
    }
  }
</script>

<template>
  <el-form>
    <el-form-item :label="`${$t('user.name')}`">
      <el-input v-model.trim="userClone.full_name" 
                tabindex="1"
                name="full_name"
                @focus="resetError"
                :placeholder="$t('user.name')"
                :class="{ error: errors.has('full_name') }"
                data-vv-validate-on="none"
                v-validate="'required'" />
      <div class="el-form-item__error" v-if="errors.has('full_name')">
        {{ errors.first('full_name') }}
      </div>
    </el-form-item>
    <el-form-item :label="`${$t('user.email')}`">
      <el-input v-model.trim="userClone.email" tabindex="1"
                name="email"
                @focus="resetError"
                :placeholder="$t('user.email')"
                :class="{ error: errors.has('email') }"
                data-vv-validate-on="none"
                v-validate="'required'" />
      <div class="el-form-item__error" v-if="errors.has('email')">
        {{ errors.first('email') }}
      </div>
    </el-form-item>
    <el-form-item :label="`${$t('user.dob')}`">
      <el-date-picker
                v-model="userClone.dob"
                type="date"
                tabindex="1"
                name="dob"
                format="dd-MM-yyyy"
                value-format="yyyy-MM-dd"
                @focus="resetError"
                :placeholder="$t('user.dob')"
                :class="{ error: errors.has('dob') }"
                data-vv-validate-on="none"
                v-validate="'required'" >
        <div class="el-form-item__error" v-if="errors.has('dob')">
          {{ errors.first('dob') }}
        </div>
      </el-date-picker>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">{{ $t('action.update') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import RemoveErrorsMixin from 'common/RemoveErrorsMixin';
  import rf from 'requestfactory'
  import { Message } from 'element-ui'
  import { cloneDeep } from 'lodash'

  export default {
    props: {
      user: {
        type: Object,
        default: () => {
          return {
            full_name: '',
            email: '',
            dob: ''
          }
        }
      }
    },
    data() {
      return {
        userClone: {
          full_name: '',
          email: '',
          dob: ''
        }
      }
    },
    mounted() {
      this.userClone = cloneDeep(this.user)
    },
    mixins: [RemoveErrorsMixin],
    methods: {
      async submit() {
        await this.$validator.validate('full_name');
        await this.$validator.validate('email');
        await this.$validator.validate('dob');
        if (this.errors.any() || this.isSubmitting) {
          return;
        }
        let params = {
          name: this.userClone.full_name,
          email: this.userClone.email,
          dob: this.userClone.dob
        }
        rf.getRequest('AuthRequest').updateCurrentUser(params)
        .then(async () => {
          this.$store.dispatch('user/updateUser', this.userClone)
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

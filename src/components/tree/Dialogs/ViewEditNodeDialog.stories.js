import { action } from '@storybook/addon-actions'
import ViewEditNodeDialog from './ViewEditNodeDialog.vue'
import { personMinimum, personComplete, personNoImages } from '@/mocks/person-profile'

export default {
  title: 'ViewEditNodeDialog'
}

const defaultMethods = {
  show: action('show profile'),
  toggleView: action('toggle view'),
  toggleNew: action('toggle new'),
  toggleDelete: action('toggle delete'),
  toggleCancel: action('toggle cancel'),
  toggleSave: action('toggle save')
}

export const CompleteProfile = () => ({
  template:
    '<ViewEditNodeDialog v-if="true" :show="true" :profile="profile" @close="toggleView" @type="type = $event" @toggleNew="toggleNew()" @toggleDelete="toggleDelete()"  @toggleSave="toggleSave()"/>',
  data: () => ({
    type: 'Child',
    profile: personComplete
  }),
  methods: defaultMethods,
  components: { ViewEditNodeDialog }
})

export const MinimumProfile = () => ({
  template: '<ViewEditNodeDialog v-if="dialog.show" :show="dialog.show" :profile="profile" @close="toggleView" @type="dialog.type = $event" @toggleNew="toggleNew()" @toggleDelete="toggleDelete()" @toggleSave="toggleSave()"/>',
  data: () => ({
    dialog: {
      show: true,
      type: 'Child'
    },
    profile: personMinimum
  }),
  methods: defaultMethods,
  components: { ViewEditNodeDialog }
})

export const NoImageProfile = () => ({
  template: '<ViewEditNodeDialog v-if="dialog.show" :show="dialog.show" :profile="profile" @close="toggleView" @type="dialog.type = $event" @toggleNew="toggleNew()" @toggleDelete="toggleDelete()" @toggleSave="toggleSave()"/>',
  data: () => ({
    dialog: {
      show: true,
      type: 'Child'
    },
    profile: personNoImages
  }),
  methods: defaultMethods,
  components: { ViewEditNodeDialog }
})

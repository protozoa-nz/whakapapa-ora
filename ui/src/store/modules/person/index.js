import Vue from 'vue'
import clone from 'lodash.clonedeep'

import { getRelatives, getPerson } from '@/lib/person-helpers'
import { getPersonMinimal, savePerson as savePersonMutation, deletePerson, getPersonFull } from './apollo-helpers'

export default function (apollo) {
  const state = {
    selectedProfile: {}, // TODO change to selectedProfileId ??
    profiles: {
      // ...minimalProfile || ...fullProfile,
      // isMinimal: true   || false
    },
    tombstoned: new Set()
  }

  const getters = {
    selectedProfile (state) {
      return state.selectedProfile
    },
    person: state => (profileId) => {
      return clone(state.profiles[profileId])
    },
    isTombstoned: state => (profileId) => {
      return state.tombstoned.has(profileId)
    }
  }

  const mutations = {
    updateSelectedProfile (state, profile) {
      state.selectedProfile = profile
    },
    setPerson (state, profile) {
      Vue.set(state.profiles, profile.id, profile)
    },
    tombstoneId (state, profileId) {
      state.tombstoned.add(profileId)
    }
  }

  async function savePerson (input) {
    const res = await apollo.mutate(
      savePersonMutation(input)
    )

    if (res.errors) throw res.errors

    return res.data.saveProfile // profileId
  }

  const actions = {
    async createPerson (_, input) {
      try {
        if (!input.type) throw new Error('a profile type is required to create a person')
        if (!input.authors) throw new Error('profile authors is required to create a person')

        return savePerson(pruneInput(input))
      } catch (err) {
        console.error('Something went wrong while trying to create a person', input)
        console.error(err)
        throw err
      }
    },
    async getPerson (_, profileId) {
      try {
        const res = await apollo.query(
          getPerson(profileId)
        )

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a person', err)
      }
    },
    async getPersonFull (_, profileId) {
      try {
        const res = await apollo.query(
          getPersonFull(profileId)
        )

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a persons details')
      }
    },
    // same as getPerson but gets a person with minimal fields rather then all fields
    async getPersonMinimal (_, profileId) {
      try {
        const res = await apollo.query(
          getPersonMinimal(profileId)
        )

        if (res.errors) throw res.errors

        return res.data.person
      } catch (err) {
        console.error('Something went wrong while trying to get a person (minimal)', profileId)
        console.error(err)
      }
    },
    async updatePerson (_, input) {
      try {
        if (!input.id) throw new Error('a profile id is required to update a person')

        return savePerson(input) // profileId
      } catch (err) {
        console.error('Something went wrong while trying to update a person', input)
        console.error(err)
      }
    },
    async deletePerson (_, { id, allowPublic }) {
      try {
        if (!id) throw new Error('a profile id is required to delete a person')

        const res = await apollo.mutate(
          deletePerson(id, allowPublic)
        )

        if (res.errors) throw res.errors

        return res.data.saveProfile
      } catch (err) {
        console.error('Something went wrong while trying to delete a person', id)
        console.error(err)
      }
    },

    updateSelectedProfile ({ commit }, profile) {
      commit('updateSelectedProfile', profile)
    },
    async loadPersonMinimal ({ state, dispatch, commit }, profileId) {
      if (state.tombstoned.has(profileId)) return

      const profile = await dispatch('getPersonMinimal', profileId)
      if (profile.tombstone) {
        commit('tombstoneId', profileId)
        dispatch('whakapapa/removeLinksToProfile', profileId, { root: true })
      } // eslint-disable-line
      else commit('setPerson', profile)
    },
    async loadPersonFull ({ state, dispatch, commit }, profileId) {
      if (state.tombstoned.has(profileId)) return

      const profile = await dispatch('getPersonFull', profileId)
      if (profile.tombstone) {
        commit('tombstoneId', profileId)
        dispatch('whakapapa/removeLinksToProfile', profileId, { root: true })
      } // eslint-disable-line
      else commit('setPerson', profile)
    },
    // NOTE: this is similar to the method below
    async setSelectedProfileById ({ dispatch, commit }, profileId) {
      var person = await dispatch('getPerson', profileId)
      commit('updateSelectedProfile', person)
    },
    async setProfileById ({ commit, rootState, dispatch }, { id, type }) {
      // NOTE to dispatch outide this namespace, we use:
      //   dispatch(actionName, data, { root: true })
      //
      // ref: https://vuex.vuejs.org/guide/modules.html#namespacing
      if (id === rootState.whoami.public.profile.id) {
        dispatch('setWhoami', id, { root: null })
      }
      if (id === rootState.whoami.personal.profile.id) {
        dispatch('setWhoami', id, { root: null })
      }
      // if viewing a story and sideview is open and you want to jump to another profile > close the story
      if (rootState.archive.showStory && rootState.dialog.preview) {
        dispatch('archive/toggleShowStory', null, { root: true })
      }
      if (type !== 'setWhanau' && rootState.dialog.dialog) {
        dispatch('setDialog', null, { root: true })
      }
      var person = await getRelatives(id, apollo)
      commit('updateSelectedProfile', person)
    }
  }

  return {
    state,
    mutations,
    actions,
    getters,
    namespaced: true
  }
}

function pruneInput (input) {
  for (const [field, value] of Object.entries(input)) {
    if (value === null) continue
    else if (typeof value === 'string' && value === '') delete input[field]
    else if (Array.isArray(value)) {
      if (
        value.length === 0 ||
        (value.length === 1 && value[0] === '')
      ) delete input[field]
    } // eslint-disable-line
    else if (typeof value === 'object' && value.add) {
      if (value.add.length === 0) delete input[field]
    }
  }

  return input
}

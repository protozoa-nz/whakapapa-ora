import gql from 'graphql-tag'
import pick from 'lodash.pick'

import {
  PERMITTED_PERSON_ATTRS,
  PERSON_FRAGMENT,
  WHAKAPAPA_LINK_FRAGMENT
} from '../../../lib/person-helpers'
import { pruneEmptyValues } from '../../../lib/profile-helpers'
import { saveProfile } from '../profile/apollo-helpers'

const GET_PERSON_MINIMAL = gql`
  query($id: String!) {
    person(id: $id){
      id
      preferredName
      legalName
      gender
      avatarImage { uri }

      aliveInterval
      deceased
      birthOrder
      
      tombstone {
        date
      }
    }
  }
`
// NOTE this doesn't load the kaitiaki adminProfile
// which may have profile details which should over-ride the group-profile
export const getPersonMinimal = (id, fetchPolicy = 'no-cache') => ({
  query: GET_PERSON_MINIMAL,
  variables: { id },
  fetchPolicy
})

const GET_PERSON_FULL = gql`
  ${PERSON_FRAGMENT}
  query($id: String!) {
    person(id: $id){
      ...ProfileFragment
      adminProfile {
        ...ProfileFragment
      }
      tombstone {
        date
      }
    }
  }
`

// TODO: check if need all the persons links, or just their minimal profile
const FIND_PERSON_BY_NAME = gql`
${PERSON_FRAGMENT}
${WHAKAPAPA_LINK_FRAGMENT}
query($name: String!, $groupId: String, $type: String) {
  findPersons(name: $name, groupId: $groupId, type: $type) {
    ...ProfileFragment
    children {
      ...ProfileFragment
      ...WhakapapaLinkFragment
    }
    parents {
      ...ProfileFragment
      ...WhakapapaLinkFragment
    }
    partners {
      ...ProfileFragment
      ...WhakapapaLinkFragment
    }
  }
}
`

export const getPersonFull = (id, fetchPolicy = 'no-cache') => ({
  query: GET_PERSON_FULL,
  variables: { id },
  fetchPolicy
})

export const savePerson = input => {
  input = pick(input, PERMITTED_PERSON_ATTRS)
  input = pruneEmptyValues(input)

  return saveProfile(input)
}

export const findPersonByName = (name, type, groupId) => {
  return {
    query: FIND_PERSON_BY_NAME,
    variables: {
      name,
      type,
      groupId // optional - can be groupId or poBoxId
    },
    fetchPolicy: 'no-cache'
  }
}

const DELETE_PERSON = gql`
  mutation($id: String!, $details: TombstoneInput, $allowPublic: Boolean) {
    tombstoneProfileAndLinks(id: $id, details: $details, allowPublic: $allowPublic)
  }
`
export function deletePerson (id, details = {}, allowPublic = false) {
  // TODO support allowPublic? this method will likely error on public person profiles
  return {
    mutation: DELETE_PERSON,
    variables: {
      id,
      details,
      allowPublic
    }
  }
}

const LIST_PERSON = gql`
query($type: String!, $tribeId: String!) {
  listPerson(type: $type, groupId: $tribeId)  {
    id
    preferredName
    legalName
    altNames
    description
    avatarImage { uri }
    gender
    aliveInterval
    placeOfBirth
    placeOfDeath
    buriedLocation
    birthOrder
    city
    country
    postCode
    profession
    education
    school

    adminProfile {
      preferredName
      legalName
      altNames
      description
      avatarImage { uri }
      gender
      aliveInterval
      placeOfBirth
      placeOfDeath
      buriedLocation
      birthOrder
      city
      country
      postCode
      profession
      education
      school

      address
      email
      phone
    }
  }
}
`

export function loadPersonList (type, tribeId) {
  return {
    query: LIST_PERSON,
    variables: {
      type,
      tribeId
    }
  }
}

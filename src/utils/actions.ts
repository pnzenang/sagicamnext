'use server'

import { error } from 'console'

import { currentUser, clerkClient } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid'

import { id } from 'date-fns/locale'

import db from './db'
import {
  DeceasedMemberSchema,
  memberSchema,
  profileSchema,
  RemovedMemberSchema,
  validateWithZodSchema
} from './schemas'
import { Prisma } from '@/generated/prisma/client'
import prisma from './db'

const randomMatriculation = customAlphabet('1234567890', 6)

const getAuthUser = async () => {
  const user = await currentUser()

  if (!user) {
    throw new Error('You must be login to access this route')
  }

  if (!user.privateMetadata.hasProfile) redirect('/profile/create')

  return user
}

const renderError = (error: unknown): { message: string } => {
  console.log(error)

  return { message: error instanceof Error ? error.message : 'An error occurred' }
}

export const createProfileAction = async (prevState: any, formData: FormData) => {
  try {
    const user = await currentUser()

    if (!user) throw new Error('Please login to create a profile')

    console.log(user)

    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.create({
      data: {
        clerkId: user.id,
        ...validatedFields
      }
    })
    ;(await clerkClient()).users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { message: 'The association Code you picked is already taken, choose a different code' }
      }
    }

    return renderError(error)
  }

  redirect('/all-members')
}

export const fetchProfile = async () => {
  const user = await getAuthUser()

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id
    }
  })

  if (!profile) redirect('/profile/create')

  return profile
}

export const updateProfileAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)

    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.update({
      where: {
        clerkId: user.id
      },
      data: validatedFields
    })
    revalidatePath('/profile')

    return { message: 'Profile updated successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const createMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    await db.member.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
        memberMatriculationNumber: `AS${validatedFields.associationCode}${randomMatriculation()}`
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          message:
            'A member with the same first names, last names date of birth and recommendation already exists, please check your previous entries or contact admin for assistance.'
        }
      }
    }

    return renderError(error)
  }

  redirect('/all-members')
}

export const fetchMembers = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return members
}

export const fetchMembersForAdmin = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    // where: {},
    orderBy: { createdAt: 'desc' }
  })

  return members
}

export const fetchSingleMemberDetails = async (memberId: string) => {
  const user = await currentUser()

  const member = await db.member.findUnique({
    where: {
      id: memberId,
      clerkId: user?.id
    }
  })

  if (!member) redirect('/all-members')

  return member
}
export const fetchSingleMemberDetailsForAdmin = async (memberId: string) => {
  const user = await currentUser()

  const member = await db.member.findUnique({
    where: {
      id: memberId
      // clerkId: user?.id
    }
  })

  if (!member) redirect('/admin')

  return member
}

export const updateMemberDetailsAction = async (prevState: any, formData: FormData) => {
  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`all-members/${memberId}/edit`)

    // return { message: `Member Details Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}
export const updateMemberDetailsActionForAdmin = async (prevState: any, formData: FormData) => {
  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`admin/${memberId}/edit`)

    // return { message: `Member Details Updated Successfully` }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          message:
            'A member with the same first names, last names date of birth and recommendation already exists, please check your previous entries or contact admin for assistance.'
        }
      }
    }
    return renderError(error)
  }

  redirect('/admin')
}

export const createRemovedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)

    await db.removedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}
export const createRemovedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)

    await db.removedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin')
}

export const fetchRemovedMembersAction = async () => {
  const user = await getAuthUser()

  const removedMembers = await db.removedMember.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return removedMembers
}

export const createDeceasedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    await db.deceasedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}
export const createDeceasedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    await db.deceasedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin')
}

export const fetchDeceasedMembersAction = async () => {
  const user = await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
}
export const fetchDeceasedMembersActionAdmin = async () => {
  const user = await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
}

export const deleteRemovedMemberAction = async (prevState: { removedMemberId: string }) => {
  const { removedMemberId } = prevState

  // await getAuthUser()

  try {
    await db.removedMember.delete({
      where: {
        id: removedMemberId
      }
    })
    revalidatePath('/removed-members')

    return { message: 'deleted member removed ' }
  } catch (error) {}

  return renderError(error)
}

export const deleteDeceasedMemberAction = async (prevState: { deceasedMemberId: string }) => {
  const { deceasedMemberId } = prevState

  // await getAuthUser()

  try {
    await db.deceasedMember.delete({
      where: {
        id: deceasedMemberId
      }
    })
    revalidatePath('/deceased-members')

    return { message: 'deceased member removed ' }
  } catch (error) {}

  return renderError(error)
}

export const fetchSingleDeceasedMemberDetails = async (deceasedMemberId: string) => {
  const user = await currentUser()

  const deceasedMember = await db.deceasedMember.findUnique({
    where: {
      id: deceasedMemberId,
      clerkId: user?.id
    }
  })

  if (!deceasedMember) redirect('/deceased-members')

  return deceasedMember
}

export const updateDeceasedMemberDetailsAction = async (prevState: any, formData: FormData) => {
  try {
    const deceasedMemberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    await db.deceasedMember.update({
      where: {
        id: deceasedMemberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`deceased-members/${deceasedMemberId}/edit`)

    // return { message: `case status Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/deceased-members')
}

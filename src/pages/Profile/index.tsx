import React, { useRef, useCallback } from 'react'
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImagePickerIOS
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Feather'
import { Form } from '@unform/mobile'
import { FormHandles } from '@unform/core'
import * as Yup from 'yup'
import ImagePicker from 'react-native-image-picker'
import getValidationErrors from '../../utils/getValidationErrors'
import api from '../../services/api'
import { useAuth } from '../../hooks/Auth'

import Input from '../../components/Input'
import Button from '../../components/Button'

import {
  Container,
  Title,
  Header,
  BackButton,
  LogoutButton,
  LogoutButtonText,
  UserAvatarButton,
  UserAvatar
} from './styles'

interface ProfileFormData {
  name: string
  email: string
  old_password: string
  password: string
  password_confirmation: string
}

const Profile: React.FC = () => {
  const { user, updateUser, signOut } = useAuth()

  const navigation = useNavigation()
  const formRef = useRef<FormHandles>(null)

  const emailInputRef = useRef<InputRef>(null)
  const oldPasswordInputRef = useRef<InputRef>(null)
  const passwordInputRef = useRef<InputRef>(null)
  const confirmPasswordInputRef = useRef<InputRef>(null)

  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({})
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório.'),
          email: Yup.string()
            .required('E-mail é obrigadtório.')
            .email('E-mail não é válido.'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string().required('Campo obrigatório.'),
            otherwise: Yup.string()
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val) => !!val.length,
              then: Yup.string().required('Campo obrigatório.'),
              otherwise: Yup.string()
            })
            .oneOf([Yup.ref('password'), null], 'Confirmação incorreta')
        })

        await schema.validate(data, { abortEarly: false })

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation
        } = data

        const formData = {
          name,
          email,
          ...(old_password
            ? {
              old_password,
              password,
              password_confirmation
            }
            : {})
        }

        const response = await api.put('/profiile', formData)

        updateUser(response.data)

        Alert.alert('Perfil atualizado com sucesso!')

        navigation.goBack()
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)
          formRef.current?.setErrors(errors)
          console.log(errors)
          return
        }

        Alert.alert(
          'Erro na Atualização do Perfil',
          'Ocorreu um erro ao atualizar seu perfil. Tente novamente.'
        )
      }
    },
    [navigation, updateUser]
  )

  const handleSignOut = useCallback(() => {
    signOut()
  }, [signOut])

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione o Avatar',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar Câmera',
        chooseFromLibraryButtonTitle: 'Escolher da Galeria'
      },
      (response) => {
        if (response.didCancel) {
          return
        }

        if (response.error) {
          Alert.alert('Erro ao atualizar avatar.')
          return
        }

        const data = new FormData()
        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpg`,
          uri: response.uri
        })

        api.patch('users/avatar', data).then((apiResponse) => {
          updateUser(apiResponse.data)
        })
      }
    )
  }, [updateUser, user.id])

  const handleGoBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <Header>
              <BackButton onPress={handleGoBack}>
                <Icon name="chevron-left" size={24} color="#999591" />
              </BackButton>

              <LogoutButton onPress={handleSignOut}>
                <LogoutButtonText>Logout</LogoutButtonText>
              </LogoutButton>
            </Header>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>Meu Perfil</Title>
            </View>

            <Form initialData={user} ref={formRef} onSubmit={handleSignUp}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailInputRef.current.focus()
                }}
              />
              <Input
                ref={emailInputRef}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  oldPasswordInputRef.current.focus()
                }}
              />
              <Input
                ref={oldPasswordInputRef}
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                containerStyle={{ marginTop: 16 }}
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus()
                }}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Nova senha"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus()
                }}
              />
              <Input
                ref={passwordInputRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar senha"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm()
                }}
              />
              <Button
                onPress={() => {
                  formRef.current?.submitForm()
                }}
              >
                Confirmar mudanças
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}

export default Profile

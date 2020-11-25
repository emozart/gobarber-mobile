import React, { useRef, useCallback } from 'react'
import {
  Image,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Feather'
import { Form } from '@unform/mobile'
import { FormHandles } from '@unform/core'
import * as Yup from 'yup'
import getValidationErrors from '../../utils/getValidationErrors'
import api from '../../services/api'

import Input from '../../components/Input'
import Button from '../../components/Button'

import logoImg from '../../assets/ListApp.png'

import {
  Container,
  AppLogo,
  Title,
  BackToSignInButton,
  BackToSignInButtonText
} from './styles'

interface SignUpFormData {
  name: string
  email: string
  password: string
}

const SignUp: React.FC = () => {
  const navigation = useNavigation()
  const formRef = useRef<FormHandles>(null)

  const emailInputRef = useRef<InputRef>(null)
  const passwordInputRef = useRef<InputRef>(null)

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({})
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome é obrigatório.'),
          email: Yup.string()
            .required('E-mail é obrigadtório.')
            .email('E-mail não é válido.'),
          password: Yup.string().min(6, 'Mínimo de 6 caracteres para senha.')
        })

        await schema.validate(data, { abortEarly: false })

        await api.post('/users', data)

        Alert.alert(
          'Cadastro realizado com sucesso!',
          'Seu cadastro foi realizado. Faça login na aplicação'
        )

        navigation.goBack()
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err)
          formRef.current?.setErrors(errors)
          console.log(errors)
          return
        }

        Alert.alert(
          'Erro no Cadastramento',
          'Ocorreu um erro ao fazer o seu cadastro. Cheque suas informações.'
        )
      }
    },
    [navigation]
  )

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
            <View>
              <AppLogo>GoBarber</AppLogo>
            </View>

            <View>
              <Title>Crie sua conta</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignUp}>
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
                  passwordInputRef.current.focus()
                }}
              />
              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Senha"
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
                Entrar
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <BackToSignInButton onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={20} color="#FFF" />
        <BackToSignInButtonText>Voltar para login</BackToSignInButtonText>
      </BackToSignInButton>
    </>
  )
}

export default SignUp

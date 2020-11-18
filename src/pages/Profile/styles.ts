import styled from 'styled-components/native'
import { Platform } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 30px ${Platform.OS === 'android' ? 150 : 40}px;
`

export const Title = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0px;
`

export const BackButton = styled.TouchableOpacity`
  flex: 1;
  margin-top: 150px;
`

export const Header = styled.View`
  display: flex;
  flex-direction: row;
  align-content: space-between;
`

export const LogoutButton = styled.TouchableOpacity`
  flex: 1;
  margin-top: 150px;
`

export const LogoutButtonText = styled.Text`
  font-size: 16px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0px;
`

export const UserAvatarButton = styled.TouchableOpacity`
  margin-top: 4px;
`

export const UserAvatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 98px;
  margin-top: 64px;
  align-self: center;
`

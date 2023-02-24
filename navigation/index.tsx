/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable, TouchableOpacity, View } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import VerifyScreen from '../screens/VerifyScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { AuthStackParamList, RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { IconButton, useTheme } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import MoreEntitiesScreen from '../screens/MoreEntitiesScreen';
import RequestsScreen from '../screens/RequestsScreen';
import WorkOrdersScreen from '../screens/WorkOrdersScreen';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const { isAuthenticated, isInitialized } = useAuth();
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {isInitialized ? (isAuthenticated ? <RootNavigator /> : <AuthNavigator />) : <LoadingScreen />}
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Root' component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name='NotFound' component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name='Modal' component={ModalScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  const { t } = useTranslation();
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name='Login' component={LoginScreen} options={{ title: t('login') }} />
      <AuthStack.Screen name='Register' component={RegisterScreen} options={{ title: t('register') }} />
      <AuthStack.Screen name='Verify' component={VerifyScreen} options={{ title: t('verify_email_title') }} />
    </AuthStack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <BottomTab.Navigator
      initialRouteName='Home'
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
      }}>
      <BottomTab.Screen
        name='Home'
        component={HomeScreen}
        options={({ navigation }: RootTabScreenProps<'Home'>) => ({
          title: t('home'),
          tabBarIcon: ({ color }) => <TabBarIcon name='home-outline' color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Modal')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name='info-circle'
                size={25}
                color={theme.colors.secondary}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name='WorkOrders'
        component={WorkOrdersScreen}
        options={{
          title: t('work_orders'),
          tabBarIcon: ({ color }) => <TabBarIcon name='clipboard-text' color={color} />,
        }}
      />
      <BottomTab.Screen
        name='AddEntities'
        component={View}
        listeners={{
          tabPress: e => {
            // Prevent default action
            e.preventDefault();
          },
        }}
        options={{
          title: t('add'),
          tabBarIcon: ({ color }) => <TabBarIcon name='plus-circle' color={theme.colors.primary} />,
        }}
      />
      <BottomTab.Screen
        name='Requests'
        component={RequestsScreen}
        options={{
          title: t('requests'),
          tabBarIcon: ({ color }) => <TabBarIcon name='inbox-arrow-down-outline' color={color} />,
        }}
      />
      <BottomTab.Screen
        name='MoreEntities'
        component={MoreEntitiesScreen}
        options={{
          title: t('more'),
          tabBarIcon: ({ color }) => <TabBarIcon name='menu' color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: IconSource;
  color: string;
}) {
  return <IconButton icon={props.name} iconColor={props.color} size={30} style={{ marginBottom: -3 }} {...props} />;
}

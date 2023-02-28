/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useRef } from 'react';
import { ColorSchemeName, Pressable, View } from 'react-native';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import VerifyScreen from '../screens/auth/VerifyScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';
import WODetailsScreen from '../screens/workOrders/WODetailsScreen';
import CreateWorkOrder from '../screens/workOrders/CreateWorkOrderScreen';
import { AuthStackParamList, RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import useAuth from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import MoreEntitiesScreen from '../screens/MoreEntitiesScreen';
import RequestsScreen from '../screens/RequestsScreen';
import WorkOrdersScreen from '../screens/workOrders/WorkOrdersScreen';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import CompleteWorkOrderModal from '../screens/workOrders/CompleteWorkOrderModal';
import SelectPartsModal from '../screens/modals/SelectPartsModal';
import TasksScreen from '../screens/workOrders/TasksScreen';
import SelectCustomersModal from '../screens/modals/SelectCustomersModal';
import SelectVendorsModal from '../screens/modals/SelectCustomersModal';
import SelectUsersModal from '../screens/modals/SelectUsersModal';
import SelectTeamsModal from '../screens/modals/SelectTeamsModal';
import SelectLocationsModal from '../screens/modals/SelectLocationsModal';
import SelectAssetsModal from '../screens/modals/SelectAssetsModal';
import SelectCategoriesModal from '../screens/modals/SelectCategoryModal';

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
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen name='Root' component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name='WODetails' component={WODetailsScreen} options={{ title: t('wo_details') }} />
      <Stack.Screen name='Tasks' component={TasksScreen}
                    options={{ title: t('tasks') }} />
      <Stack.Screen name='NotFound' component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Screen name='AddWorkOrder' component={CreateWorkOrder} options={{ title: t('create_work_order') }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name='Modal' component={ModalScreen} />
        <Stack.Screen name='CompleteWorkOrder' component={CompleteWorkOrderModal}
                      options={{ title: t('complete_work_order') }} />
        <Stack.Screen name='SelectParts' component={SelectPartsModal}
                      options={{ title: t('select_parts') }} />
        <Stack.Screen name='SelectCustomers' component={SelectCustomersModal}
                      options={{ title: t('select_customers') }} />
        <Stack.Screen name='SelectVendors' component={SelectVendorsModal}
                      options={{ title: t('select_vendors') }} />
        <Stack.Screen name='SelectUsers' component={SelectUsersModal}
                      options={{ title: t('select_users') }} />
        <Stack.Screen name='SelectTeams' component={SelectTeamsModal}
                      options={{ title: t('select_teams') }} />
        <Stack.Screen name='SelectLocations' component={SelectLocationsModal}
                      options={{ title: t('select_locations') }} />
        <Stack.Screen name='SelectAssets' component={SelectAssetsModal}
                      options={{ title: t('select_assets') }} />
        <Stack.Screen name='SelectCategories' component={SelectCategoriesModal}
                      options={{ title: t('select_categories') }} />
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

function BottomTabNavigator({ navigation }: RootTabScreenProps<'Home'>) {
  const theme = useTheme();
  const { t } = useTranslation();
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const entities: { title: string; icon: IconSource; goTo: keyof RootStackParamList }[] = [{
    title: t('work_order'),
    icon: 'clipboard-text-outline',
    goTo: 'AddWorkOrder'
  },
    { title: t('request'), icon: 'inbox-arrow-down-outline', goTo: 'AddRequest' },
    { title: t('asset'), icon: 'package-variant-closed', goTo: 'AddAsset' },
    { title: t('location'), icon: 'map-marker-outline', goTo: 'AddLocation' },
    { title: t('part'), icon: 'archive-outline', goTo: 'AddPart' },
    { title: t('meter'), icon: 'gauge', goTo: 'AddMeter' },
    { title: t('user'), icon: 'account-outline', goTo: 'AddUser' }
  ];
  return (
    <View style={{ height: '100%' }}>
      <ActionSheet ref={actionSheetRef}>
        <View style={{ padding: 15 }}>
          <Text variant='headlineSmall'>{t('create')}</Text>
          <Divider />
          <List.Section>
            {entities.map((entity, index) => <List.Item key={index} title={entity.title}
                                                        left={() => <List.Icon icon={entity.icon} />}
                                                        onPress={() => {
                                                          navigation.navigate(entity.goTo);
                                                        }} />)}
          </List.Section>
        </View>
      </ActionSheet>
      <BottomTab.Navigator
        initialRouteName='Home'
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary
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
                  opacity: pressed ? 0.5 : 1
                })}>
                <FontAwesome
                  name='info-circle'
                  size={25}
                  color={theme.colors.secondary}
                  style={{ marginRight: 15 }}
                />
              </Pressable>
            )
          })}
        />
        <BottomTab.Screen
          name='WorkOrders'
          component={WorkOrdersScreen}
          options={{
            title: t('work_orders'),
            tabBarIcon: ({ color }) => <TabBarIcon name='clipboard-text' color={color} />
          }}
        />
        <BottomTab.Screen
          name='AddEntities'
          component={View}
          listeners={{
            tabPress: e => {
              // Prevent default action
              e.preventDefault();
              actionSheetRef.current.show();
            }
          }}
          options={{
            title: t('create'),
            tabBarIcon: ({ color }) => <TabBarIcon name='plus-circle' color={theme.colors.primary} />
          }}
        />
        <BottomTab.Screen
          name='Requests'
          component={RequestsScreen}
          options={{
            title: t('requests'),
            tabBarIcon: ({ color }) => <TabBarIcon name='inbox-arrow-down-outline' color={color} />
          }}
        />
        <BottomTab.Screen
          name='MoreEntities'
          component={MoreEntitiesScreen}
          options={{
            title: t('more'),
            tabBarIcon: ({ color }) => <TabBarIcon name='menu' color={color} />
          }}
        />
      </BottomTab.Navigator>
    </View>
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

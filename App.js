import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native"; // Ajout pour éviter les soucis d'affichage
import ChoixAppareilScreen from "./screens/ChoixAppareilScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import GenererCodeScreen from "./screens/GenererCodeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";  

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1 }}> 
        <Stack.Navigator initialRouteName="ChoixAppareil">
          <Stack.Screen name="ChoixAppareil" component={ChoixAppareilScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="GenererCode" component={GenererCodeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}
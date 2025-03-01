import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
  } from "react-native";
  import React, { useState } from "react";
  import Spacing from "../constants/Spacing";
  import FontSize from "../constants/FontSize";
  import Colors from "../constants/Colors";
  import Font from "../constants/Font";
  import { NativeStackScreenProps } from "@react-navigation/native-stack";
  import { RootStackParamList } from "../constants/types";
  import * as Clipboard from "expo-clipboard";
  
  type Props = NativeStackScreenProps<RootStackParamList, "GenererCode">;
  
  const GenererCodeScreen: React.FC<Props> = () => {
    const [code, setCode] = useState("");
  
    const genererCode = () => {
      const nouveauCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setCode(nouveauCode);
    };
  
    const copierCode = async () => {
      if (code) {
        await Clipboard.setStringAsync(code);
        Alert.alert("Code copié", "Le code a été copié dans le presse-papiers.");
      } else {
        Alert.alert("Erreur", "Aucun code à copier.");
      }
    };
  
    return (
      <SafeAreaView>
        <View
          style={{
            padding: Spacing * 2,
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Text
            style={{
              fontSize: FontSize.xLarge,
              color: Colors.primary,
              fontFamily: Font["poppins-bold"],
              marginBottom: Spacing * 2,
            }}
          >
            Code de Suivi
          </Text>
  
          <Text
            style={{
              fontSize: FontSize.large,
              color: Colors.text,
              fontFamily: Font["poppins-regular"],
              marginBottom: Spacing * 2,
            }}
          >
            {code || "Générez un code pour commencer"}
          </Text>
  
          <TouchableOpacity
            onPress={genererCode}
            style={{
              padding: Spacing * 2,
              backgroundColor: Colors.primary,
              marginVertical: Spacing,
              borderRadius: Spacing,
              shadowColor: Colors.primary,
              shadowOffset: {
                width: 0,
                height: Spacing,
              },
              shadowOpacity: 0.3,
              shadowRadius: Spacing,
            }}
          >
            <Text
              style={{
                fontFamily: Font["poppins-bold"],
                color: Colors.onPrimary,
                textAlign: "center",
                fontSize: FontSize.large,
              }}
            >
              Générer un code
            </Text>
          </TouchableOpacity>
  
          {code && (
            <TouchableOpacity
              onPress={copierCode}
              style={{
                padding: Spacing * 2,
                backgroundColor: Colors.secondary,
                marginVertical: Spacing,
                borderRadius: Spacing,
                shadowColor: Colors.secondary,
                shadowOffset: {
                  width: 0,
                  height: Spacing,
                },
                shadowOpacity: 0.3,
                shadowRadius: Spacing,
              }}
            >
              <Text
                style={{
                  fontFamily: Font["poppins-bold"],
                  color: Colors.onSecondary,
                  textAlign: "center",
                  fontSize: FontSize.large,
                }}
              >
                Copier le code
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  };
  
  export default GenererCodeScreen;
  
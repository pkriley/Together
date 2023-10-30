import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { PanResponderGestureState, StyleSheet, Text, View, Image } from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Svg, {Circle} from 'react-native-svg';
import { useFonts, Assistant_200ExtraLight, Assistant_500Medium } from '@expo-google-fonts/assistant';
import firebase from 'firebase';
import 'firebase/firestore';
import { db } from './firebase';
import * as Location from 'expo-location';

var location: any = null;
var swipe: string = "None";
var answer1: string = "";
var answer2: string = "";
var answered1: number = 0;
var answered2: number = 0;
var chartData = [
  // {
  //   x: 41.1616617,
  //   y: -80.0870045
  // }
  {
    x: 41.2416617,
    y: -80.0870045,
    id: "sdfesf",
    answered1: 4,
    answered2: 3
  },
  {
    x: 41.1452342,
    y: -80.121312,
    id: "sfesft",
    answered1: 5,
    answered2: 1,
  },
  {
    x: 41.0952342,
    y: -80.041312,
    id: "gefsft",
    answered1: 3,
    answered2: 5
  }
]

export default function App() {
  let [fontsLoaded] = useFonts({
    Assistant_200ExtraLight,
    Assistant_500Medium
  })  

  Location.installWebGeolocationPolyfill()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        location = [position.coords.latitude, position.coords.longitude]

        var xDif = location[0];
        var yDif = location[1];
    
        console.log (xDif, yDif);
    
        //This list should only be points within .1 of user coordinates
        chartData.forEach(point => {
          point.x = ((point.x - xDif) * 1000)/2 + 50;
          point.y = ((point.y - yDif) * 1000)/2 + 50;
        });
        //console.log(location)
      },
      (err) => console.log(err),
      { enableHighAccuracy: true, timeout: 8000 }
    );

  }, []);

  const Stack = createNativeStackNavigator()

  const logo = require('./assets/logo.png')

  //Load Splash
  if (!fontsLoaded) {
    return(
      <Image source={logo} />
    )
  }
  else {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false
          }}>
          <Stack.Screen
            name="PromptScreen"
            component={PromptScreen}
          />
          <Stack.Screen
            name="ScatterScreen"
            component={ScatterScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  
}

const PromptScreen = ({ navigation }) => {
  const [prompt, setPrompt] = useState("");
  const [ans1, setAns1] = useState("Yes");
  const [ans2, setAns2] = useState("No");

  //Run it once
  useEffect(() => {
    db.collection('prompts').doc('rB9Bl8U7Hr2HediIXmOy').get().then(res => {
      setPrompt(res.data()?.question);
      answered1=0;
      answered2=0;

      //Get Prompt Answers
      setAns1(res.data()?.answer1);
      setAns2(res.data()?.answer2);
  
      //Count up data from each array
      res.data()?.answered1.forEach((zone: { responses: number; }) => {
        answered1 += zone.responses
      });
      res.data()?.answered2.forEach((zone: {responses: number; }) => {
        answered2 += zone.responses
      });  

      //Make Chart Data -- Adjust the coordinates, then display this information
      var ans1Data = res.data()?.answered1;
      var and2Data = res.data()?.answered2;
    })
  }, []);
  
  return (
    <GestureRecognizer style={styles.container} onSwipe={(direction, state) => {
      //upload results to nearest Population Zone
      console.log(state.dx);
      if (state.dx > 50) {
        navigation.navigate('ScatterScreen', {dir: 'SWIPE_RIGHT'})
      } 
      else if (state.dx < -50) {
        navigation.navigate('ScatterScreen', {dir: 'SWIPE_LEFT'})
      }
      if (direction === 'SWIPE_LEFT' || direction === 'SWIPE_RIGHT') {
        navigation.navigate('ScatterScreen', {dir: direction})
      }
    }
    }>
      <Text style={styles.text}>{prompt}</Text>
      <View style={styles.answer}>
        <Text style={styles.text}>{ans2}</Text>
        <Text style={styles.text}>{ans1}</Text>
      </View>
      <Text style={styles.text}>{}</Text>
      <StatusBar style="auto" />
    </GestureRecognizer >
  )
}

const ScatterScreen = ({ navigation, route }) => {

  const [prompt, setPrompt] = useState("");

  var text:string = "Together";
  var radius;

  useEffect(() => {
    db.collection('prompts').doc('rB9Bl8U7Hr2HediIXmOy').get().then(res => {
      setPrompt(res.data()?.question);
    })
  }, [])

  //Answer1
  if (route.params.dir == 'SWIPE_RIGHT') {
    radius = answered1;
  }
  //Answer2
  else if (route.params.dir == 'SWIPE_LEFT') {
    radius=answered2;
  } 

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{prompt}</Text>
      <Svg height="30%" width="50%">
        {/* Your Circle */}
        <Circle 
          cx="50%"
          cy="50%"
          r={radius?.toString()}
          stroke="black"
          fill="black"
        />
        {/* Other Circles */}
        {chartData.map(info => {
          if (text === "Together") {
            return (
              <Circle key={info.id} cx={info.x.toString().concat("%")} cy={info.y.toString().concat("%")} r={info.answered1} stroke="black" fill="black" />
            );
            // return (
            //   <Circle key={info.zoneId} cx={info.latLon[0].toString().concat("%")} cy={info.latLon[1].toString().concat("%") r={info.responses}} />
            // );
          } else {
            return (
              <Circle key={info.id} cx={info.x.toString().concat("%")} cy={info.y.toString().concat("%")} r={info.answered2} stroke="black" fill="black" />
            );
          }

        })}
      </Svg>
      <Text style={styles.text}>{text}</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  answer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignContent: 'space-around'
  },

  text: {
    fontFamily: 'Assistant_500Medium',
  },

});

//Find nearest population zone and update it
function uploadResponse() {

}
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Keyboard, TextInput, Modal, ScrollView, Alert } from 'react-native';
import firebase from 'firebase';
import db from '../config'
import { render } from 'react-dom';
import MyHeader from '../Components/MyHeader';
import {DrawerItems} from 'react-navigation-drawer';
import Welcome from '../screens/Welcome';
import {Avatar} from 'react-native-elements'
import * as ImagePicker from 'expo-image-picker'

export default class CustomSideBarMenu extends React.Component{
    constructor(props){
        super(props)
        this.state={
            UserId : firebase.auth().currentUser.email,
            Image: "#",
            name: "",
            docId: "",
            Username: ""
        }
    }
    componentDidMount(){
        this.fetchImage(this.state.UserId)
        this.getDetails(this.state.Username)
    }
    getDetails=()=>{
        var user = firebase.auth().currentUser.email
        db.collection('usersbetter').where('UserId', '==', user).get()
        .then(snapshot=>{
          snapshot.forEach(doc=>{
            var data = doc.data()
            // console.log(data)
            this.setState({
              Username:data.Username,
              docId:doc.id
            })
          })
        })
      }
    fetchImage=(ImageName)=>{
        var image = firebase.storage().ref().child("user_profiles" + ImageName)
        image.getDownloadURL().then(
            uri => {
                this.setState({
                    Image: uri
                })
            }
        ).catch(err=>{
            this.setState({
                Image: "#",
            })
            console.log(err)
        })
    }
    uploadImage=async (uri,ImageName)=>{
    var response = await fetch(uri)
    var blob = await response.blob()
    var storage = firebase.storage().ref().child("user_profiles" + ImageName)
    return storage.put(blob).then(
        reponse =>{
            this.fetchImage(ImageName)
        }
    )
    }
    selectPicture= async()=>{
        const {cancelled,uri} = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspectRatio: [4,3],
            quality: '1',
        })
        if(!cancelled){
            console.log("PIC CANCELLED")
            this.setState({
                Image: uri
            })
            this.uploadImage(uri, this.state.UserId)
        }
    }
    render(){
        return(
            <View style={{flex: 1}}>
            <View style={{flex:0.5, alignItems: 'center', backgroundColor: "turquoise"}}>
                <Avatar
                rounded
                source = {{uri:this.state.Image}}
                size= "medium"
                showEditButton
                onPress={()=>{
                    this.selectPicture()
                }}
                containerStyle={styles.ImageContainer}
                />
             <Text style={{fontWeight:"bold",marginTop:15}}>{this.state.Username}</Text>
             </View>
            <View style={{flex:0.8}}>
            <DrawerItems  {...this.props}  >
            </DrawerItems>
            </View>
            <View style={{flex:0.2, justifyContent: "flex-end"}}>
                <TouchableOpacity style={{width:'100%', height: 30, backgroundColor: "#39d2d8", justifyContent: 'center'}}
                onPress={()=>{
                    const signout=firebase.auth().signOut()
                    if(signout){
                        this.props.navigation.navigate('Welcome');
                    }else{
                        alert("You could not be signed out," + firebase.auth().currentUser.email  + ", due to an internal error. Here is what that error was: " + error.message)
                    }
                }}
                >
                    <Text>Logout</Text>
                </TouchableOpacity>
            </View>
            </View>
        )
    }
}

const styles=StyleSheet.create({
    ImageContainer:{
        flex: 0.75, 
        width: "40%", 
        height: "20%", 
        marginLeft: 20, 
        marginTop: 30, 
        borderRadius: 40,
    }
})
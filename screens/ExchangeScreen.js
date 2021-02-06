import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Keyboard, TextInput, Modal, ScrollView, Alert } from 'react-native';
import firebase from 'firebase';
import db from '../config'
import Header from '../Components/Header'
import {isMobile} from 'react-device-detect';

export default class Exchange extends React.Component{
constructor(props){
    super(props);
    this.state={
        UserId: firebase.auth().currentUser.email,
        ItemName:"",
        Description: "",
        IsExchangeRequestActive: "",
        docId: "",
    }
}

createUniqueId(){
    return(
        Math.random().toString(12).substring(7)
    )
}

updateItemRequestStatus = ()=>{
    db.collection('Barter_Items').doc(this.state.docId).update({
        ItemStatus: "Received",
    })
    db.collection('users').where('UserId', '==', this.state.UserId).get()
    .then(
        snapshot =>{
                snapshot.forEach((doc=>{
                    db.collection('users').doc(doc.id).update({
                        IsExchangeRequestActive: false,
                    })
                })) 
        }
    )
    this.setState({
        IsExchangeRequestActive: false
    })
}


getIsExchangeRequestActive =()=>{
    db.collection('users')
    .where('UserId', '==', this.state.UserId)
    .onSnapshot(snapshot=>{
        snapshot.forEach(doc=>{
            this.setState({
                IsExchangeRequestActive: doc.data().IsExchangeRequestActive,
                docId : doc.id
            })
        })
    })
}
componentDidMount(){
    this.getIsExchangeRequestActive()
}
getExchangeRequest=()=>{
    db.collection('Barter_Items').where("UserId", '==', this.state.UserId).get()
    .then(
        snapshot=>{
            snapshot.forEach(doc=>{
                if(doc.data().ItemStatus !== 'Received'){
                this.setState({
                    RequestId: doc.data().RequestId,
                    ItemName: doc.data().ItemName,
                    ItemStatus: doc.data().ItemStatus,
                    docId: doc.id
                })
                }
            })
        }
    )
}
storeItem(ItemName, Description){
var userid = this.state.UserId;
var requestId = this.createUniqueId();
db.collection('Barter_Items').add({
    UserId: userid,
    ItemName: ItemName,
    Description: Description,
    RequestId: requestId
})
this.setState({
    ItemName:"",
    Description: "",
});
return alert(
    ItemName + "has successfully been requested, and we will try to get it to you, " + firebase.auth().currentUser.email + "as soon as possible."
    // [
    //     {text:'Thanks', onPress:()=>{
    //         this.props.navigation.navigate('Drawer');
    //     }}
    // ]
)
}
render(){
    if(this.state.IsExchangeRequestActive === false){
        console.log(this.state.IsExchangeRequestActive)
        return(
            <View>
            <Header title="Request An Item"></Header>
            <TextInput placeholder="Please enter the name of the item you are requesting."
            style={styles.inputBox}
            multiline
            numberOfLines={4}
            onChangeText={text=>{
                this.setState({
               ItemName: text 
                })
            }}
            value={this.state.ItemName}
            ></TextInput>
            <TextInput placeholder={"Enter a link to the item that you would like, or a description of the item. A link is preferred, as it is easier to know exactly what you are requesting."}
           style={styles.inputBox}
           multiline
           numberOfLines={8}
            onChangeText={text=>{
                this.setState({
                    Description: text
                })
            }}
            value={this.state.Description}
            ></TextInput>
            <TouchableOpacity
            style={styles.button}
            onPress={()=>{
                this.storeItem(this.state.ItemName,this.state.Description);
                this.setState({
                    IsExchangeRequestActive: true
                })
            }}
            >
            <Text>Send Request</Text>
            </TouchableOpacity>
        </View>
        )
      
    }else{
        console.log(this.state.ItemName)
        return(
            <View style={{flex:1, justifyContent: 'center'}}>
            <Text>
                Item Name:
            </Text>
            <Text>
                {this.state.ItemName} 
            </Text>
            <Text>
                Item Status
            </Text>
            <Text>
                {this.state.ItemStatus}
            </Text>
            <TouchableOpacity
             style={styles.button}
             onPress={()=>{
                 this.updateItemRequestStatus()
             }}
            >
               <Text>I have received this book.</Text> 
            </TouchableOpacity>
            </View>
        )
    }
  
}
}

const styles= StyleSheet.create({
    // keyboardstyle:{
    //     flex:1,
    //     alignItems:'center',
    //     justifyContent: ' center'
    // },
    inputBox:{
        width:'100%',
        height:35,
        alignSelf:'center',
        borderColor:'#ffab91',
        borderRadius:10,
        borderWidth:1,
        marginTop:20,
        padding:10
    },
    button:{
        width:'100%',
        height: 20,
        justifyContent: "center",
        alignItems: 'center',
        borderRadius: 1,
        backgroundColor: "#4fa9d8",
        marginTop: 30,
        shadowColor: "black",
        shadowOpacity: 0.53,
        // shadowOffset:{width:23, height: 34}
    }
})
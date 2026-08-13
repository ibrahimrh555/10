import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppButton, AppHeader, AppText, Avatar, ProgressIndicator, ScreenContainer, ScreenTitle } from "@/components/ui";
import { theme } from "@/design-system";
export default function PhotoScreen(){const [selected,setSelected]=useState(false);return <ScreenContainer footer={<AppButton label="Terminer" icon="arrow-forward" onPress={()=>router.push("/notifications-permission")}/>}><AppHeader/><ProgressIndicator step={3}/><ScreenTitle dark="Ajoutez" accent="une photo" description="Ajoutez une photo pour permettre aux autres joueurs de vous reconnaître."/><Avatar selected={selected}/><View style={styles.actions}><AppButton label="Prendre une photo" icon="camera-outline" variant="secondary" onPress={()=>setSelected(true)}/><AppButton label="Choisir dans la galerie" icon="image-outline" variant="secondary" onPress={()=>setSelected(true)}/><AppText color="primary" onPress={()=>router.push("/notifications-permission")} style={styles.later}>Plus tard</AppText></View></ScreenContainer>}
const styles=StyleSheet.create({actions:{gap:theme.spacing.xs,marginTop:theme.spacing.xl},later:{minHeight:44,paddingTop:theme.spacing.sm,textAlign:"center",textDecorationLine:"underline"}});


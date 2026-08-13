import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet } from "react-native";
import { AppButton, AppHeader, AppText, OtpInput, ScreenContainer, ScreenTitle } from "@/components/ui";
import { theme } from "@/design-system";
import { isOtpComplete } from "@/components/ui/otp";
export default function OtpScreen(){const [code,setCode]=useState("");const {intent}=useLocalSearchParams<{intent?:string}>();const next=()=>intent==="login"?router.replace("/home"):router.push("/name");return <ScreenContainer footer={<AppButton disabled={!isOtpComplete(code)} label="Continuer" icon="arrow-forward" onPress={next} />}><AppHeader/><ScreenTitle dark="Vérifiez" accent="votre numéro" description="Code envoyé au +212 6 12 34 56 78"/><OtpInput value={code} onChange={setCode}/><AppText style={styles.timer} color="textSecondary">Renvoyer le code dans <AppText color="primary">00:45</AppText></AppText><AppText style={styles.resend} color="primary">Renvoyer le code</AppText></ScreenContainer>}
const styles=StyleSheet.create({timer:{marginTop:theme.spacing["3xl"],textAlign:"center"},resend:{marginTop:theme.spacing.xl,textAlign:"center"}});

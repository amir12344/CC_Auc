"use client";

import { Amplify } from "aws-amplify";

import outputs from "../../amplify_outputs.json";

Amplify.configure(outputs, { ssr: true });

export default function ConfigureAmplifyClientSide() {
  // This component doesn't render anything, it's just for executing Amplify.configure().
  return null;
}

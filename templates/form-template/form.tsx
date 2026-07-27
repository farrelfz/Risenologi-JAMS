"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { featureSchema } from '../schema'
// import { performAction } from '../actions'

export function FeatureForm() {
  const form = useForm({
    // resolver: zodResolver(featureSchema),
    defaultValues: {
      // fields
    },
  });

  async function onSubmit(data: any) {
    // const formData = new FormData()
    // Append data
    // await performAction(formData)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form Fields using shadcn/ui */}
      <button type="submit">Submit</button>
    </form>
  );
}

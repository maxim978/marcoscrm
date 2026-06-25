import { NewProjectForm } from '@/components/salesmachine/NewProjectForm'

export default function NewProjectPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-[var(--font-syne)] font-extrabold text-3xl text-white mb-2">
          Nieuw project aanmaken
        </h1>
        <p className="text-white/40 text-sm">
          Beschrijf je business in gewone taal — AI bouwt het rest automatisch op.
        </p>
      </div>
      <NewProjectForm />
    </div>
  )
}

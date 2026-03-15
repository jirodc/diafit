import { AdminHeader } from "./AdminLayout";

export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <>
      <AdminHeader title={title} subtitle="This section is coming soon." />
      <div className="flex flex-1 items-center justify-center p-12">
        <p className="text-slate-500">Content for {title} will be available here.</p>
      </div>
    </>
  );
}

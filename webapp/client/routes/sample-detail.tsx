import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button.js";
import { useCreateSampleItem, useDeleteSampleItem, useSampleItem, useUpdateSampleItem } from "../hooks/use-sample-items.js";
import { useExecApiHandling } from "../hooks/use-exec-api-handling.js";
import type { CreateSampleItemInput } from "../../shared/validators/index.js";

const emptyForm: CreateSampleItemInput = {
  code: "",
  name: "",
  category: "",
  description: "",
  quantity: 0,
  price: 0,
  isActive: true,
};

export function SampleDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const execApiHandling = useExecApiHandling();
  const isNew = !id || id === "new";
  const { data, isLoading } = useSampleItem(isNew ? undefined : id);
  const createMutation = useCreateSampleItem();
  const updateMutation = useUpdateSampleItem();
  const deleteMutation = useDeleteSampleItem();
  const [form, setForm] = useState<CreateSampleItemInput>(emptyForm);

  useEffect(() => {
    if (data) {
      setForm({
        code: data.code,
        name: data.name,
        category: data.category,
        description: data.description ?? "",
        quantity: data.quantity,
        price: data.price,
        isActive: data.isActive,
      });
    }
  }, [data]);

  const title = useMemo(() => (isNew ? "SampleDetail - New" : "SampleDetail"), [isNew]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await execApiHandling(async () => {
      if (isNew) {
        const created = await createMutation.mutateAsync(form);
        navigate(`/samples/${created.id}`);
        return;
      }

      await updateMutation.mutateAsync({ id: id!, data: form });
    });
  };

  const handleDelete = async () => {
    if (isNew) {
      return;
    }

    await execApiHandling(async () => {
      await deleteMutation.mutateAsync(id!);
      navigate("/samples");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">追加、編集、削除のサンプルです。</p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to="/samples"
        >
          Back to SampleList
        </Link>
      </div>

      {isLoading && !isNew ? (
        <p>Loading...</p>
      ) : (
        <form className="grid gap-4 rounded-lg border p-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="code">
              Code
            </label>
            <input
              id="code"
              className="w-full rounded-md border px-3 py-2"
              value={form.code}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="w-full rounded-md border px-3 py-2"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="category">
              Category
            </label>
            <input
              id="category"
              className="w-full rounded-md border px-3 py-2"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="quantity">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              className="w-full rounded-md border px-3 py-2"
              value={form.quantity}
              onChange={(event) => setForm((current) => ({ ...current, quantity: Number(event.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="price">
              Price
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              className="w-full rounded-md border px-3 py-2"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="min-h-28 w-full rounded-md border px-3 py-2"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium md:col-span-2">
            <input
              checked={form.isActive}
              type="checkbox"
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Active
          </label>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit">{isNew ? "Create" : "Save"}</Button>
            {!isNew ? (
              <Button type="button" variant="destructive" onClick={() => void handleDelete()}>
                Delete
              </Button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}

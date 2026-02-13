"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Github,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectForm } from "@/components/projects/project-form";
import { toast } from "@/hooks/use-toast";
import { ProjectFormData } from "@/types";

interface Project {
  id: string;
  name: string;
  clientName: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  jiraProjectKey: string;
  jiraDomain: string;
  slackWebhookUrl: string | null;
  isActive: boolean;
  _count?: { reports: number };
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (data: ProjectFormData) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.error) {
      toast({
        title: "Error creating project",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Project created",
      description: `${data.name} has been added.`,
      variant: "success",
    });
    setDialogOpen(false);
    fetchProjects();
  };

  const handleUpdate = async (data: ProjectFormData) => {
    if (!editingProject) return;
    const res = await fetch(`/api/projects/${editingProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.error) {
      toast({
        title: "Error updating project",
        description: result.error,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Project updated",
      description: `${data.name} has been updated.`,
      variant: "success",
    });
    setEditingProject(null);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      toast({
        title: "Project deleted",
        variant: "success",
      });
      fetchProjects();
    } catch (err) {
      toast({
        title: "Error deleting project",
        description:
          err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configure your projects with GitHub, Jira, and Slack settings.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
              <DialogDescription>
                Configure a new project with its GitHub repository, Jira board,
                and optional Slack integration.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              onSubmit={handleCreate}
              onCancel={() => setDialogOpen(false)}
              submitLabel="Create Project"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog
        open={!!editingProject}
        onOpenChange={(open) => {
          if (!open) setEditingProject(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project configuration.
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              initialData={{
                ...editingProject,
                slackWebhookUrl: editingProject.slackWebhookUrl ?? undefined,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingProject(null)}
              submitLabel="Update Project"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Projects List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-60 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Github className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <h3 className="mb-2 text-lg font-medium">No projects yet</h3>
            <p className="mb-4 text-sm text-zinc-500">
              Add your first project to start generating EOD reports.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <CardDescription>{project.clientName}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingProject(project)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Github className="h-3.5 w-3.5" />
                    <a
                      href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {project.githubOwner}/{project.githubRepo}
                    </a>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                    <Badge variant="outline" className="text-xs">
                      {project.jiraProjectKey}
                    </Badge>
                    <span>{project.jiraDomain}</span>
                  </div>
                  {project.slackWebhookUrl && (
                    <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs">Slack connected</span>
                    </div>
                  )}
                  {project._count && (
                    <p className="text-xs text-zinc-400">
                      {project._count.reports} report
                      {project._count.reports !== 1 ? "s" : ""} generated
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

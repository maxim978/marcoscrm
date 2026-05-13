import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { addSupportEvent } from '@/app/actions/support'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ContactCard } from '@/components/targets/ContactCard'
import { Mail, Globe, Hash, Calendar, Plus, Link as LinkIcon, Phone, Video, Edit2, User } from 'lucide-react'

export default async function TargetDetailPage({ params }: { params: { id: string } }) {
  async function addSupportEventAction(formData: FormData) {
    'use server'
    await addSupportEvent(formData)
  }

  const supabase = await createClient()

  // Fetch Target
  const { data: target } = await supabase
    .from('targets')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!target) {
    return <div>Target not found</div>
  }

  // Fetch Support Events
  const { data: supportEvents } = await supabase
    .from('support_events')
    .select('*, releases(title)')
    .eq('target_id', target.id)
    .order('date', { ascending: false })

  // Fetch user's releases for the dropdown
  const { data: releases } = await supabase
    .from('releases')
    .select('id, title')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {target.name}
            <Badge variant="outline" className="ml-2">{target.type}</Badge>
          </h2>
          <p className="text-slate-500 text-lg mt-1">{target.platform} • {target.country || 'No country'}</p>
        </div>
        <Badge variant={target.relationship_status === 'warm' ? 'default' : 'secondary'} className="text-sm px-4 py-1">
          {target.relationship_status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Target Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Contact Info</CardTitle>
              <ContactCard 
                target={target} 
                trigger={
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {target.contact_name && (
                <div className="flex items-center gap-3 text-sm font-medium">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{target.contact_name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>{target.email || 'No email provided'}</span>
              </div>
              {target.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>{target.phone}</span>
                </div>
              )}
              
              <div className="pt-2 flex flex-wrap gap-2">
                {target.instagram_url && (
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <a href={target.instagram_url} target="_blank" rel="noreferrer">
                      <Globe className="h-4 w-4 mr-2 text-pink-500" /> Instagram
                    </a>
                  </Button>
                )}
                {target.facebook_url && (
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <a href={target.facebook_url} target="_blank" rel="noreferrer">
                      <LinkIcon className="h-4 w-4 mr-2 text-blue-600" /> Facebook
                    </a>
                  </Button>
                )}
                {target.tiktok_url && (
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <a href={target.tiktok_url} target="_blank" rel="noreferrer">
                      <Video className="h-4 w-4 mr-2 text-slate-900" /> TikTok
                    </a>
                  </Button>
                )}
                {target.social_links?.spotify && (
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <a href={target.social_links.spotify} target="_blank" rel="noreferrer">
                      <Globe className="h-4 w-4 mr-2 text-green-500" /> Spotify
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Hash className="h-4 w-4" />
                <span>Followers: {target.followers?.toLocaleString() || 'Unknown'}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold mb-2">Notes</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{target.notes || 'No notes available.'}</p>
              </div>
            </CardContent>
          </Card>


          {/* Add Support Event Form */}
          <Card>
            <CardHeader>
              <CardTitle>Log Support</CardTitle>
              <CardDescription>Track when this target supported a release.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={addSupportEventAction} className="space-y-4">
                <input type="hidden" name="target_id" value={target.id} />
                
                <div className="space-y-2">
                  <Label htmlFor="release_id">Release</Label>
                  <Select name="release_id">
                    <SelectTrigger>
                      <SelectValue placeholder="Select release (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / General</SelectItem>
                      {releases?.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support_type">Type of Support</Label>
                  <Select name="support_type" required defaultValue="playlist add">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="playlist add">Playlist Add</SelectItem>
                      <SelectItem value="radio spin">Radio Spin</SelectItem>
                      <SelectItem value="social post">Social Media Post</SelectItem>
                      <SelectItem value="blogpost">Blog Post / Review</SelectItem>
                      <SelectItem value="repost">Repost</SelectItem>
                      <SelectItem value="dj support">DJ Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proof_link">Proof Link (URL)</Label>
                  <Input id="proof_link" name="proof_link" type="url" placeholder="https://" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_impact">Estimated Impact / Reach</Label>
                  <Input id="estimated_impact" name="estimated_impact" placeholder="e.g. 5k listeners" />
                </div>

                <SubmitButton className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Save Support Event
                </SubmitButton>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {/* Support History */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Support History</CardTitle>
              <CardDescription>A timeline of all recorded support from this target.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Release</TableHead>
                    <TableHead>Support Type</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead className="text-right">Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportEvents && supportEvents.length > 0 ? (
                    supportEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="whitespace-nowrap">
                          {event.date ? new Date(event.date).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          {event.releases?.title || 'General'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{event.support_type}</Badge>
                        </TableCell>
                        <TableCell>{event.estimated_impact || '-'}</TableCell>
                        <TableCell className="text-right">
                          {event.proof_link ? (
                            <Button asChild variant="ghost" size="sm">
                              <a href={event.proof_link} target="_blank" rel="noreferrer">
                                <LinkIcon className="h-4 w-4 text-blue-500" />
                              </a>
                            </Button>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                        No support history logged yet. Use the form to add an event.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

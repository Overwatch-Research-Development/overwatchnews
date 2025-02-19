import { Select, Adapt, Sheet, YStack, Label } from '@my/ui'
import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useState } from 'react'
import { LinearGradient } from 'tamagui/linear-gradient'

interface UserSelectProps {
  placeholder?: string
  onSelect: (userIds: string[]) => void
}

export function UserSelect({ placeholder = 'Select users', onSelect }: UserSelectProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const { data: users } = api.user.list.useQuery()

  const handleValueChange = (values: string[]) => {
    setSelectedUsers(values)
    onSelect(values)
  }

  return (
    <Select value={selectedUsers.join(',')} onValueChange={(value) => handleValueChange(value.split(','))} multiple>
      <Select.Trigger>
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet modal dismissOnSnapToBottom>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <Select.Content>
        <Select.ScrollUpButton />
        <Select.Viewport>
          <Select.Group>
            <Select.Label>Collaborators</Select.Label>
            {users?.map((user) => (
              <Select.Item key={user.id} value={user.id}>
                <Select.ItemText>{user.name || user.email}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton />
      </Select.Content>
    </Select>
  )
}

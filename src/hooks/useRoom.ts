import { useEffect, useState } from "react"
import { database } from "../services/firebase"
import { useAuth } from "./useAuth"

//Tipo: objeto( Record ), chave: string, valor: objeto( {} )
type FirebaseQuestions = Record<string, {
  author: {
    name: string
    avatar: string
  }
  content: string
  isAnswered: boolean
  isHighlighted: boolean
  likes: Record<string, {
    authorId: string
  }>
}>


type QuestionProps= {
  id: string,
  author: {
    name: string
    avatar: string
  }
  content: string
  isAnswered: boolean
  isHighlighted: boolean
  likeCount: number
  likeId: string | undefined
}

export function useRoom(roomId: string) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<QuestionProps[]>([])
  const [title, setTitle] = useState()

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`)

    roomRef.on('value', room => { //listen an event / (once = just one time)
      const databaseRoom = room.val()
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {}
      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isAnswered: value.isAnswered,
          isHighlighted: value.isHighlighted,
          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0]
        }
      })

      setTitle(databaseRoom.title)
      setQuestions(parsedQuestions)
    })

    return () => {
      roomRef.off('value')
    }
  }, [roomId, user?.id])

  return { questions, title }
}
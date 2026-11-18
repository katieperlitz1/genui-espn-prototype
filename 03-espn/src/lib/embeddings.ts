import { pipeline, env } from '@huggingface/transformers'
import { LEAF_COMPONENTS } from './componentCatalog'

env.allowLocalModels = false

type Embedding = number[]

interface ComponentEmbedding {
  name: string
  embedding: Embedding
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingPipeline: any = null
let componentEmbeddingsCache: ComponentEmbedding[] | null = null

async function getEmbeddingPipeline(onFirstLoad?: () => void) {
  if (embeddingPipeline) return embeddingPipeline
  onFirstLoad?.()
  embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  return embeddingPipeline
}

async function embedText(text: string, onFirstLoad?: () => void): Promise<Embedding> {
  const pipe = await getEmbeddingPipeline(onFirstLoad)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output: any = await pipe(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

function cosineSimilarity(a: Embedding, b: Embedding): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function getComponentEmbeddings(onFirstLoad?: () => void): Promise<ComponentEmbedding[]> {
  if (componentEmbeddingsCache) return componentEmbeddingsCache
  componentEmbeddingsCache = await Promise.all(
    LEAF_COMPONENTS.map(async (c) => ({
      name: c.name,
      embedding: await embedText(c.description, onFirstLoad),
    }))
  )
  return componentEmbeddingsCache
}

export async function retrieveTopComponents(
  contextText: string,
  topK = 10,
  onFirstLoad?: () => void
): Promise<{ name: string; score: number }[]> {
  const [componentEmbeddings, contextEmbedding] = await Promise.all([
    getComponentEmbeddings(onFirstLoad),
    embedText(contextText, onFirstLoad),
  ])

  return componentEmbeddings
    .map(c => ({ name: c.name, score: cosineSimilarity(c.embedding, contextEmbedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

export function clearEmbeddingsCache() {
  componentEmbeddingsCache = null
}

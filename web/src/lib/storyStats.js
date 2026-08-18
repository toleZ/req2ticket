/* Resumen de un conjunto de historias. Lo comparten la card de sprint y la fila de épica:
   las dos muestran los mismos números sobre distintos recortes del backlog. */

export function summarizeStories(stories) {
  const done = stories.filter((story) => story.status === 'done')

  return {
    total: stories.length,
    completed: done.length,
    points: stories.reduce((sum, story) => sum + story.points, 0),
    pointsCompleted: done.reduce((sum, story) => sum + story.points, 0),
  }
}

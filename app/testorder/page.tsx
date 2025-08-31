import { prisma } from '@/lib/prisma'
import { decodeId } from '@/lib/utils/sqids'

export default async function TestOrderPage() {
  try {
    // Fetch course data directly on the server
    const courseId = decodeId('iQdjIg')
    if (!courseId) {
      return <div className="p-8 text-red-500">Invalid course ID</div>
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              orderBy: {
                order_index: 'asc'
              }
            }
          },
          orderBy: {
            order_index: 'asc'
          }
        },
        lessons: {
          where: {
            section_id: null
          },
          orderBy: {
            order_index: 'asc'
          }
        }
      }
    })

    if (!course) {
      return <div className="p-8 text-red-500">Course not found</div>
    }

    // Transform the data
    const sections = course.sections?.map(section => ({
      id: section.id,
      title: section.title,
      lessons: section.lessons?.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        global_order_index: lesson.global_order_index
      })) || []
    })) || []

    const level0Videos = course.lessons?.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      global_order_index: lesson.global_order_index
    })) || []

    // Create unified order
    const allItems = [
      ...sections.map(section => ({
        type: 'section' as const,
        id: section.id,
        title: section.title,
        globalOrderIndex: Math.min(...(section.lessons?.map(l => l.global_order_index || 0) || [0])),
        lessons: section.lessons
      })),
      ...level0Videos.map(video => ({
        type: 'video' as const,
        id: video.id,
        title: video.title,
        globalOrderIndex: video.global_order_index || 0
      }))
    ].sort((a, b) => a.globalOrderIndex - b.globalOrderIndex)

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Order Page</h1>
        <h2 className="text-lg mb-4">Course: {course.title}</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-4">📋 Unified Level 0 Elements (Ordered by global_order_index):</h3>
          <div className="space-y-3">
            {allItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  item.type === 'section' 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    item.type === 'section' ? 'bg-blue-500' : 'bg-green-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.type === 'section' ? 'section:' : 'level 0 video:'} {item.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      global_order_index: {item.globalOrderIndex}
                      {item.type === 'section' && (
                        <span className="ml-2">({item.lessons?.length || 0} lessons)</span>
                      )}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    item.type === 'section' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'section' ? 'Section' : 'Level 0'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="text-sm text-gray-600">
            Total Items: {allItems.length}<br/>
            Sections: {sections.length}<br/>
            Level 0 Videos: {level0Videos.length}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Raw Data:</h3>
          <details className="text-xs">
            <summary className="cursor-pointer">Click to expand</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-xs">
              {JSON.stringify({
                sections: sections,
                level0Videos: level0Videos,
                unifiedOrder: allItems
              }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in TestOrderPage:', error)
    return <div className="p-8 text-red-500">Error: {error instanceof Error ? error.message : 'Unknown error'}</div>
  }
} 
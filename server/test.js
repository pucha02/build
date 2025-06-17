
const API_URL = 'https://openapi.keycrm.app/v1/pipelines/3/statuses';
const ACCESS_TOKEN = 'NTg5MmRjZjUwMDhjZTMzOGE4NzZmYTQzNzQ0Mjc0Y2FiODQ4ZjVkZA';
const keycrmApiUrl = 'https://openapi.keycrm.app/v1/pipelines/cards';

const pipelineId = 3;
const statusId = 37;
// const fetchPipelines = async () => {
//     try {
//         const response = await fetch(API_URL, {
//             method: 'GET',
//             headers: {
//                 Authorization: `Bearer ${ACCESS_TOKEN}`,
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`Ошибка HTTP: ${response.status}`);
//         }

//         const data = await response.json();
//         console.log('Список воронок:', data);
//     } catch (error) {
//         console.error('Ошибка при получении воронок:', error.message);
//     }
// };

async function sendToKeyCRM() {
    try {
      const body = {
        title: '',
        source_id: 1,
        manager_comment: '',
        manager_id: 1,
        pipeline_id: pipelineId,
        status_id: statusId,
        contact: {
          full_name: '',
          email: '',
          phone: '',
        },
      };
  
      const response = await fetch(keycrmApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}, ${await response.text()}`);
      }
  
      const data = await response.json();
      console.log('Lead created:', data);
    } catch (error) {
      console.error('Error sending data to KeyCRM:', error.message);
    }
  }
  sendToKeyCRM();

import { supabase } from '../lib/supabaseClient'

const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*')

  if (error) {
    console.error('Error fetching data:', error)
  } else {
    console.log('Data fetched successfully:', data)
  }
}


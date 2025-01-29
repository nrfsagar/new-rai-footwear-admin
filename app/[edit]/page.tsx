// "use client"
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { updateStock } from '@/lib/actions/actions';
// import React, { useState } from 'react'

// const page = ({params}:any) => {
//   // const page = await getInstaPageById(params.edit);
//   const [stock,setStock]=useState<string>('')
//   const handleSubmit=async()=>{
//       const update=await updateStock(params.edit,Number(stock))
//       if (update){
//           alert("this product stock get updated")
//       }
//   }
  
//   return (
//     <div>
//       <Input 
//               type="number" 
//               placeholder="Enter New Stock" 
//               value={stock}
//               onChange={(e:any) => {
//                 setStock(e.target.value);
                
//               }}
//               className="w-full"
              
//             />
//             <Button 
//             onClick={handleSubmit} 
//             className="w-full" 
//           >
            
//           </Button>
//     </div>
//   )
// }

// export default page

"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Package2 } from 'lucide-react';
import { updateStock } from '@/lib/actions/actions';

const Page = ({ params }: any) => {
  const [stock, setStock] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const update = await updateStock(params.edit, Number(stock));
      if (update) {
        alert("This product stock has been updated");
        setStock('');
      }
    } catch (error) {
      alert("Failed to update stock");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" />
            <CardTitle>Update Stock</CardTitle>
          </div>
          <CardDescription>
            Enter the new stock quantity for this product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Enter new stock quantity"
              value={stock}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setStock(e.target.value);
              }}
              className="w-full"
              min="0"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={!stock || isLoading}
          >
            {isLoading ? "Updating..." : "Update Stock"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Page;